import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models.models import (
    JobRole, User, TrainingProgram,
    TrainingVideo, Quiz, QuizQuestion,
    QuizAttempt, VideoProgress, Certificate
)
from app.routers import auth, training, job_roles, progress, quiz, certificates, admin

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Construction Safety Training System",
    description="API for managing worker safety training and compliance",
    version="1.0.0"
)

origins = [
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(training.router)
app.include_router(job_roles.router)
app.include_router(progress.router)
app.include_router(quiz.router)
app.include_router(certificates.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "Construction Safety API is running ✅"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}