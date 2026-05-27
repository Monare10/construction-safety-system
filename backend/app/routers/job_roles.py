from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import JobRole
from app.schemas.schemas import JobRoleOut
from app.utils.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/job-roles", tags=["Job Roles"])


# ── GET ALL JOB ROLES (anyone logged in can see this) ──
@router.get("/", response_model=List[JobRoleOut])
def get_job_roles(
    db: Session = Depends(get_db)
):
    """Get all available job roles — public endpoint for registration"""
    return db.query(JobRole).all()


# ── GET SINGLE JOB ROLE ────────────────────────────────
@router.get("/{role_id}", response_model=JobRoleOut)
def get_job_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get a single job role by ID"""
    role = db.query(JobRole).filter(JobRole.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job role not found"
        )
    return role


# ── CREATE JOB ROLE (admin only) ───────────────────────
@router.post("/", response_model=JobRoleOut)
def create_job_role(
    name: str,
    description: str = None,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    """Create a new job role — admin only"""
    existing = db.query(JobRole).filter(JobRole.name == name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job role already exists"
        )
    role = JobRole(name=name, description=description)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role