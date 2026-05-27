from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

# This handles password hashing and checking
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# This tells FastAPI where to look for the token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ── Password helpers ───────────────────────────────────
def hash_password(password: str) -> str:
    """Turn a plain password into a secure hash"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if a plain password matches the stored hash"""
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT helpers ────────────────────────────────────────
def create_access_token(data: dict) -> str:
    """Create a JWT token that expires after set minutes"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


# ── Get current logged in user ─────────────────────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Extract user from JWT token — used to protect routes"""
    payload = decode_token(token)
    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


# ── Admin only protection ──────────────────────────────
def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Only allow admins through — used to protect admin routes"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user