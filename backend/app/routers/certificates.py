from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import uuid
from app.database import get_db
from app.models.models import (
    Certificate, QuizAttempt, Quiz,
    TrainingProgram, User
)
from app.schemas.schemas import CertificateOut, CertificateStatusOut
from app.utils.auth import get_current_user
from app.utils.pdf_generator import generate_certificate_pdf

router = APIRouter(prefix="/certificates", tags=["Certificates"])


def generate_certificate_number() -> str:
    """Generate a unique certificate number"""
    unique = str(uuid.uuid4()).upper()[:8]
    year = datetime.now().year
    return f"CERT-{year}-{unique}"


# ── GENERATE CERTIFICATE AFTER PASSING ────────────────
@router.post("/generate/{program_id}", response_model=CertificateOut)
def generate_certificate(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a certificate for a worker who passed the quiz.
    Called automatically after a successful quiz submission.
    """

    # Get the program
    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == program_id
    ).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )

    # Check worker actually passed the quiz
    quiz = db.query(Quiz).filter(
        Quiz.training_program_id == program_id
    ).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No quiz found for this program"
        )

    passed_attempt = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.quiz_id == quiz.id,
        QuizAttempt.passed == True
    ).first()

    if not passed_attempt:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must pass the quiz before receiving a certificate"
        )

    # Check if certificate already exists
    existing = db.query(Certificate).filter(
        Certificate.user_id == current_user.id,
        Certificate.training_program_id == program_id
    ).first()
    if existing:
        return existing

    # Create certificate — valid for 1 year
    now = datetime.utcnow()
    expires = now + timedelta(days=365)

    certificate = Certificate(
        user_id=current_user.id,
        training_program_id=program_id,
        issued_at=now,
        expires_at=expires,
        certificate_number=generate_certificate_number()
    )
    db.add(certificate)
    db.commit()
    db.refresh(certificate)
    return certificate


# ── DOWNLOAD CERTIFICATE AS PDF ────────────────────────
@router.get("/download/{program_id}")
def download_certificate(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download the certificate as a PDF file"""

    # Get certificate
    certificate = db.query(Certificate).filter(
        Certificate.user_id == current_user.id,
        Certificate.training_program_id == program_id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No certificate found. Complete the training and pass the quiz first."
        )

    # Get program and quiz details
    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == program_id
    ).first()

    quiz = db.query(Quiz).filter(
        Quiz.training_program_id == program_id
    ).first()

    # Get the best score
    best_attempt = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.quiz_id == quiz.id,
        QuizAttempt.passed == True
    ).order_by(QuizAttempt.score.desc()).first()

    score = best_attempt.score if best_attempt else 0
    job_role = current_user.job_role.name if current_user.job_role else "General Worker"

    # Generate PDF
    pdf_bytes = generate_certificate_pdf(
        worker_name=current_user.full_name,
        training_title=program.title,
        job_role=job_role,
        certificate_number=certificate.certificate_number,
        issued_at=certificate.issued_at,
        expires_at=certificate.expires_at,
        score=score
    )

    # Return PDF as downloadable file
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f"attachment; filename="
                f"certificate_{certificate.certificate_number}.pdf"
            )
        }
    )


# ── GET MY CERTIFICATES ────────────────────────────────
@router.get("/my-certificates", response_model=List[CertificateStatusOut])
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all certificates for the current worker with status"""

    if not current_user.job_role_id:
        return []

    programs = db.query(TrainingProgram).filter(
        TrainingProgram.job_role_id == current_user.job_role_id
    ).all()

    result = []
    now = datetime.utcnow()

    for program in programs:
        cert = db.query(Certificate).filter(
            Certificate.user_id == current_user.id,
            Certificate.training_program_id == program.id
        ).first()

        if not cert:
            status_str = "not_certified"
            result.append(CertificateStatusOut(
                program_id=program.id,
                program_title=program.title,
                has_certificate=False,
                status=status_str
            ))
        else:
            # Check if expired
            if cert.expires_at.replace(tzinfo=None) < now:
                status_str = "expired"
            else:
                status_str = "certified"

            result.append(CertificateStatusOut(
                program_id=program.id,
                program_title=program.title,
                has_certificate=True,
                status=status_str,
                certificate_number=cert.certificate_number,
                issued_at=cert.issued_at,
                expires_at=cert.expires_at
            ))

    return result