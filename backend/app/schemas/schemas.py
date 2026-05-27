from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Job Role ──────────────────────────────────────────
class JobRoleOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ── Register ──────────────────────────────────────────
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    job_role_id: Optional[int] = None


# ── Login ─────────────────────────────────────────────
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ── User Response ──────────────────────────────────────
class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_eligible: bool
    job_role: Optional[JobRoleOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Token ──────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ── Training Video ─────────────────────────────────────
class TrainingVideoCreate(BaseModel):
    title: str
    video_url: str
    order_index: Optional[int] = 1
    duration_seconds: Optional[int] = 0


class TrainingVideoOut(BaseModel):
    id: int
    title: str
    video_url: str
    order_index: int
    duration_seconds: int

    class Config:
        from_attributes = True


# ── Training Program ───────────────────────────────────
class TrainingProgramCreate(BaseModel):
    title: str
    description: Optional[str] = None
    job_role_id: int
    pass_mark: Optional[int] = 70
    max_attempts: Optional[int] = 3


class TrainingProgramUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    pass_mark: Optional[int] = None
    max_attempts: Optional[int] = None


# ── Quiz Question ──────────────────────────────────────
class QuizQuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str


class QuizQuestionOut(BaseModel):
    id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str

    class Config:
        from_attributes = True


class QuizQuestionWithAnswer(BaseModel):
    id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str

    class Config:
        from_attributes = True


# ── Quiz ───────────────────────────────────────────────
class QuizCreate(BaseModel):
    title: str
    time_limit_minutes: Optional[int] = 30


class QuizOut(BaseModel):
    id: int
    title: str
    time_limit_minutes: int
    training_program_id: int
    questions: List[QuizQuestionOut] = []

    class Config:
        from_attributes = True


class QuizOutAdmin(BaseModel):
    id: int
    title: str
    time_limit_minutes: int
    training_program_id: int
    questions: List[QuizQuestionWithAnswer] = []

    class Config:
        from_attributes = True


# ── NEW: Quiz Summary ──────────────────────────────────
class QuizSummaryOut(BaseModel):
    id: int
    title: str
    time_limit_minutes: int
    questions: List[QuizQuestionOut] = []

    class Config:
        from_attributes = True


# ── UPDATED: Training Program ──────────────────────────
class TrainingProgramOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    pass_mark: int
    max_attempts: int
    job_role: Optional[JobRoleOut] = None
    videos: List[TrainingVideoOut] = []
    quiz: Optional[QuizSummaryOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Video Progress ─────────────────────────────────────
class VideoProgressUpdate(BaseModel):
    watched_seconds: int


class VideoProgressOut(BaseModel):
    id: int
    user_id: int
    video_id: int
    watched_seconds: int
    completed: bool

    class Config:
        from_attributes = True


# ── Training Status ────────────────────────────────────
class VideoStatusOut(BaseModel):
    video_id: int
    title: str
    duration_seconds: int
    watched_seconds: int
    completed: bool


class TrainingStatusOut(BaseModel):
    program_id: int
    program_title: str
    total_videos: int
    completed_videos: int
    all_videos_completed: bool
    ready_for_quiz: bool
    videos: List[VideoStatusOut]


# ── Quiz Attempt ───────────────────────────────────────
class QuizAnswerSubmit(BaseModel):
    answers: dict


class QuizAttemptOut(BaseModel):
    id: int
    user_id: int
    quiz_id: int
    score: float
    passed: bool
    attempt_number: int
    taken_at: datetime

    class Config:
        from_attributes = True


class QuizResultOut(BaseModel):
    score: float
    passed: bool
    attempt_number: int
    attempts_remaining: int
    correct_answers: int
    total_questions: int
    message: str


# ── Certificate ────────────────────────────────────────
class CertificateOut(BaseModel):
    id: int
    user_id: int
    training_program_id: int
    issued_at: datetime
    expires_at: datetime
    certificate_number: str

    class Config:
        from_attributes = True


class CertificateStatusOut(BaseModel):
    program_id: int
    program_title: str
    has_certificate: bool
    status: str
    certificate_number: Optional[str] = None
    issued_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


# ── Admin ──────────────────────────────────────────────
class WorkerComplianceOut(BaseModel):
    worker_id: int
    full_name: str
    email: str
    job_role: Optional[str] = None
    is_eligible: bool
    total_programs: int
    completed_programs: int
    certificates: List[CertificateStatusOut] = []

    class Config:
        from_attributes = True


class EligibilityUpdate(BaseModel):
    is_eligible: bool