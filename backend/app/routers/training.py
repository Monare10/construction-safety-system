from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import TrainingProgram, TrainingVideo, User
from app.schemas.schemas import (
    TrainingProgramCreate,
    TrainingProgramUpdate,
    TrainingProgramOut,
    TrainingVideoCreate,
    TrainingVideoOut
)
from app.utils.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/training", tags=["Training"])


# ══════════════════════════════════════════════════════
#  TRAINING PROGRAMS
# ══════════════════════════════════════════════════════

# ── GET ALL PROGRAMS (admin sees all, worker sees theirs) ──
@router.get("/programs", response_model=List[TrainingProgramOut])
def get_programs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin: sees all training programs
    Worker: only sees programs for their job role
    """
    if current_user.role == "admin":
        return db.query(TrainingProgram).all()

    if not current_user.job_role_id:
        return []

    return db.query(TrainingProgram).filter(
        TrainingProgram.job_role_id == current_user.job_role_id
    ).all()


# ── GET SINGLE PROGRAM ─────────────────────────────────
@router.get("/programs/{program_id}", response_model=TrainingProgramOut)
def get_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == program_id
    ).first()

    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )

    return program


# ── CREATE PROGRAM (admin only) ────────────────────────
@router.post("/programs", response_model=TrainingProgramOut)
def create_program(
    program_data: TrainingProgramCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    program = TrainingProgram(
        title=program_data.title,
        description=program_data.description,
        job_role_id=program_data.job_role_id,
        pass_mark=program_data.pass_mark,
        max_attempts=program_data.max_attempts
    )
    db.add(program)
    db.commit()
    db.refresh(program)
    return program


# ── UPDATE PROGRAM (admin only) ────────────────────────
@router.patch("/programs/{program_id}", response_model=TrainingProgramOut)
def update_program(
    program_id: int,
    program_data: TrainingProgramUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == program_id
    ).first()

    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )

    if program_data.title is not None:
        program.title = program_data.title
    if program_data.description is not None:
        program.description = program_data.description
    if program_data.pass_mark is not None:
        program.pass_mark = program_data.pass_mark
    if program_data.max_attempts is not None:
        program.max_attempts = program_data.max_attempts

    db.commit()
    db.refresh(program)
    return program


# ── DELETE PROGRAM (REPLACED VERSION) ───────────────────
@router.delete("/programs/{program_id}")
def delete_program(
    program_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    """Delete a training program and all related data — admin only"""
    from app.models.models import (
        TrainingVideo, Quiz, QuizQuestion,
        QuizAttempt, VideoProgress, Certificate
    )

    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == program_id
    ).first()

    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )

    videos = db.query(TrainingVideo).filter(
        TrainingVideo.training_program_id == program_id
    ).all()

    for video in videos:
        db.query(VideoProgress).filter(
            VideoProgress.video_id == video.id
        ).delete()

    db.query(TrainingVideo).filter(
        TrainingVideo.training_program_id == program_id
    ).delete()

    quiz = db.query(Quiz).filter(
        Quiz.training_program_id == program_id
    ).first()

    if quiz:
        db.query(QuizAttempt).filter(
            QuizAttempt.quiz_id == quiz.id
        ).delete()

        db.query(QuizQuestion).filter(
            QuizQuestion.quiz_id == quiz.id
        ).delete()

        db.delete(quiz)

    db.query(Certificate).filter(
        Certificate.training_program_id == program_id
    ).delete()

    db.delete(program)
    db.commit()

    return {
        "message": "Training program and all related data deleted successfully"
    }


# ══════════════════════════════════════════════════════
#  TRAINING VIDEOS
# ══════════════════════════════════════════════════════

@router.get("/programs/{program_id}/videos",
            response_model=List[TrainingVideoOut])
def get_videos(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == program_id
    ).first()

    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )

    return db.query(TrainingVideo).filter(
        TrainingVideo.training_program_id == program_id
    ).order_by(TrainingVideo.order_index).all()


@router.post("/programs/{program_id}/videos",
             response_model=TrainingVideoOut)
def add_video(
    program_id: int,
    video_data: TrainingVideoCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == program_id
    ).first()

    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )

    video = TrainingVideo(
        training_program_id=program_id,
        title=video_data.title,
        video_url=video_data.video_url,
        order_index=video_data.order_index,
        duration_seconds=video_data.duration_seconds
    )

    db.add(video)
    db.commit()
    db.refresh(video)
    return video


@router.delete("/programs/{program_id}/videos/{video_id}")
def delete_video(
    program_id: int,
    video_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    video = db.query(TrainingVideo).filter(
        TrainingVideo.id == video_id,
        TrainingVideo.training_program_id == program_id
    ).first()

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    db.delete(video)
    db.commit()

    return {"message": "Video deleted successfully"}