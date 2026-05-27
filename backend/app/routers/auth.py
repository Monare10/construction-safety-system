from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, JobRole
from app.schemas.schemas import UserRegister, UserLogin, UserOut, Token
from app.utils.auth import (
    hash_password, verify_password,
    create_access_token, get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── REGISTER ───────────────────────────────────────────
@router.post("/register", response_model=UserOut)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new worker account"""

    # Check if email is already taken
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check job role exists if provided
    if user_data.job_role_id:
        job_role = db.query(JobRole).filter(
            JobRole.id == user_data.job_role_id
        ).first()
        if not job_role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job role not found"
            )

    # Create the new user with hashed password
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="worker",          # all self-registered users are workers
        job_role_id=user_data.job_role_id,
        is_eligible=False       # not eligible until admin approves
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ── LOGIN ──────────────────────────────────────────────
@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login and receive a JWT token"""

    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()

    # Check user exists and password is correct
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Create JWT token with user id and role inside
    token = create_access_token(data={
        "sub": str(user.id),
        "role": user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


# ── GET CURRENT USER ───────────────────────────────────
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently logged in user's details"""
    return current_user


# ── CREATE ADMIN (one time setup) ─────────────────────
@router.post("/create-admin", response_model=UserOut)
def create_admin(user_data: UserRegister, db: Session = Depends(get_db)):
    """Create an admin account — use this once to set up your first admin"""

    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    admin = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="admin",
        is_eligible=True
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return admin