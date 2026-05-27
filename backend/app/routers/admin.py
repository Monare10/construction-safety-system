from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.models import (
    User, Certificate, TrainingProgram
)
from app.schemas.schemas import (
    WorkerComplianceOut, CertificateStatusOut,
    EligibilityUpdate, UserOut
)
from app.utils.auth import get_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── GET ALL WORKERS ────────────────────────────────────
@router.get("/workers", response_model=List[UserOut])
def get_all_workers(
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    """Get all worker accounts — admin only"""
    return db.query(User).filter(User.role == "worker").all()


# ── GET WORKER COMPLIANCE STATUS ───────────────────────
@router.get("/workers/{worker_id}/compliance",
            response_model=WorkerComplianceOut)
def get_worker_compliance(
    worker_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    """Get a worker's full compliance status — admin only"""

    worker = db.query(User).filter(
        User.id == worker_id,
        User.role == "worker"
    ).first()

    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found"
        )

    programs = []
    if worker.job_role_id:
        programs = db.query(TrainingProgram).filter(
            TrainingProgram.job_role_id == worker.job_role_id
        ).all()

    cert_statuses = []
    now = datetime.utcnow()
    completed = 0

    for program in programs:
        cert = db.query(Certificate).filter(
            Certificate.user_id == worker.id,
            Certificate.training_program_id == program.id
        ).first()

        if not cert:
            status_str = "not_certified"
        elif cert.expires_at.replace(tzinfo=None) < now:
            status_str = "expired"
        else:
            status_str = "certified"
            completed += 1

        cert_statuses.append(CertificateStatusOut(
            program_id=program.id,
            program_title=program.title,
            has_certificate=cert is not None,
            status=status_str,
            certificate_number=cert.certificate_number if cert else None,
            issued_at=cert.issued_at if cert else None,
            expires_at=cert.expires_at if cert else None
        ))

    return WorkerComplianceOut(
        worker_id=worker.id,
        full_name=worker.full_name,
        email=worker.email,
        job_role=worker.job_role.name if worker.job_role else None,
        is_eligible=worker.is_eligible,
        total_programs=len(programs),
        completed_programs=completed,
        certificates=cert_statuses
    )


# ── APPROVE OR DENY SITE ELIGIBILITY ──────────────────
@router.patch("/workers/{worker_id}/eligibility",
              response_model=UserOut)
def update_eligibility(
    worker_id: int,
    eligibility: EligibilityUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    """Approve or deny a worker's site eligibility — admin only"""

    worker = db.query(User).filter(
        User.id == worker_id,
        User.role == "worker"
    ).first()

    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found"
        )

    worker.is_eligible = eligibility.is_eligible
    db.commit()
    db.refresh(worker)
    return worker


# ── GET ALL CERTIFICATES ───────────────────────────────
@router.get("/certificates")
def get_all_certificates(
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    """Get all certificates with expiry status — admin only"""

    certificates = db.query(Certificate).all()
    now = datetime.utcnow()
    result = []

    for cert in certificates:
        worker = db.query(User).filter(
            User.id == cert.user_id
        ).first()
        program = db.query(TrainingProgram).filter(
            TrainingProgram.id == cert.training_program_id
        ).first()

        expired = cert.expires_at.replace(tzinfo=None) < now

        result.append({
            "certificate_number": cert.certificate_number,
            "worker_name": worker.full_name if worker else "Unknown",
            "worker_email": worker.email if worker else "Unknown",
            "training_program": program.title if program else "Unknown",
            "issued_at": cert.issued_at,
            "expires_at": cert.expires_at,
            "status": "expired" if expired else "certified"
        })

    return result


# ── GET REPORTS ────────────────────────────────────────
@router.get("/reports")
def get_reports(
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    """Get overall compliance reports — admin only"""

    total_workers = db.query(User).filter(
        User.role == "worker"
    ).count()

    eligible_workers = db.query(User).filter(
        User.role == "worker",
        User.is_eligible == True
    ).count()

    total_certificates = db.query(Certificate).count()

    now = datetime.utcnow()
    expired_certificates = db.query(Certificate).filter(
        Certificate.expires_at < now
    ).count()

    active_certificates = total_certificates - expired_certificates

    return {
        "total_workers": total_workers,
        "eligible_workers": eligible_workers,
        "ineligible_workers": total_workers - eligible_workers,
        "total_certificates_issued": total_certificates,
        "active_certificates": active_certificates,
        "expired_certificates": expired_certificates,
    }