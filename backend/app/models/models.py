from sqlalchemy import (
    Column, Integer, String, Boolean,
    ForeignKey, DateTime, Text, Float
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class JobRole(Base):
    __tablename__ = "job_roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    users = relationship("User", back_populates="job_role")
    training_programs = relationship("TrainingProgram", back_populates="job_role")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="worker")
    job_role_id = Column(Integer, ForeignKey("job_roles.id"), nullable=True)
    is_eligible = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    job_role = relationship("JobRole", back_populates="users")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")
    video_progress = relationship("VideoProgress", back_populates="user")


class TrainingProgram(Base):
    __tablename__ = "training_programs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    job_role_id = Column(Integer, ForeignKey("job_roles.id"), nullable=False)
    pass_mark = Column(Integer, default=70)
    max_attempts = Column(Integer, default=3)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    job_role = relationship("JobRole", back_populates="training_programs")
    videos = relationship("TrainingVideo", back_populates="training_program")
    quiz = relationship("Quiz", back_populates="training_program", uselist=False)
    certificates = relationship("Certificate", back_populates="training_program")


class TrainingVideo(Base):
    __tablename__ = "training_videos"

    id = Column(Integer, primary_key=True, index=True)
    training_program_id = Column(Integer, ForeignKey("training_programs.id"), nullable=False)
    title = Column(String(200), nullable=False)
    video_url = Column(String(500), nullable=False)
    order_index = Column(Integer, default=1)
    duration_seconds = Column(Integer, default=0)

    # Relationships
    training_program = relationship("TrainingProgram", back_populates="videos")
    progress = relationship("VideoProgress", back_populates="video")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    training_program_id = Column(Integer, ForeignKey("training_programs.id"), nullable=False)
    title = Column(String(200), nullable=False)
    time_limit_minutes = Column(Integer, default=30)

    # Relationships
    training_program = relationship("TrainingProgram", back_populates="quiz")
    questions = relationship("QuizQuestion", back_populates="quiz")
    attempts = relationship("QuizAttempt", back_populates="quiz")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(300), nullable=False)
    option_b = Column(String(300), nullable=False)
    option_c = Column(String(300), nullable=False)
    option_d = Column(String(300), nullable=False)
    correct_option = Column(String(1), nullable=False)

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    score = Column(Float, default=0)
    passed = Column(Boolean, default=False)
    attempt_number = Column(Integer, default=1)
    taken_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")


class VideoProgress(Base):
    __tablename__ = "video_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    video_id = Column(Integer, ForeignKey("training_videos.id"), nullable=False)
    watched_seconds = Column(Integer, default=0)
    completed = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="video_progress")
    video = relationship("TrainingVideo", back_populates="progress")


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    training_program_id = Column(Integer, ForeignKey("training_programs.id"), nullable=False)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    certificate_number = Column(String(50), unique=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="certificates")
    training_program = relationship("TrainingProgram", back_populates="certificates")