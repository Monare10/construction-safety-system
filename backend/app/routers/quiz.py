from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import (
    Quiz, QuizQuestion, QuizAttempt,
    TrainingProgram, VideoProgress, TrainingVideo, User
)
from app.schemas.schemas import (
    QuizCreate, QuizOut, QuizOutAdmin,
    QuizQuestionCreate, QuizQuestionOut,
    QuizAnswerSubmit, QuizAttemptOut, QuizResultOut
)
from app.utils.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/quiz", tags=["Quiz"])


# ══════════════════════════════════════════════════════
#  ADMIN — CREATE & MANAGE QUIZZES
# ══════════════════════════════════════════════════════

# ── CREATE QUIZ FOR A PROGRAM ──────────────────────────
@router.post("/programs/{program_id}", response_model=QuizOut)
def create_quiz(
    program_id: int,
    quiz_data: QuizCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    """Create a quiz for a training program — admin only"""

    # Check program exists
    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == program_id
    ).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )

    # Check quiz doesn't already exist for this program
    existing = db.query(Quiz).filter(
        Quiz.training_program_id == program_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz already exists for this program"
        )

    quiz = Quiz(
        training_program_id=program_id,
        title=quiz_data.title,
        time_limit_minutes=quiz_data.time_limit_minutes
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz


# ── ADD QUESTION TO QUIZ ───────────────────────────────
@router.post("/{quiz_id}/questions", response_model=QuizOut)
def add_question(
    quiz_id: int,
    question_data: QuizQuestionCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    """Add a question to a quiz — admin only"""

    # Check quiz exists
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )

    # Validate correct_option is a, b, c, or d
    if question_data.correct_option.lower() not in ["a", "b", "c", "d"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="correct_option must be a, b, c, or d"
        )

    question = QuizQuestion(
        quiz_id=quiz_id,
        question_text=question_data.question_text,
        option_a=question_data.option_a,
        option_b=question_data.option_b,
        option_c=question_data.option_c,
        option_d=question_data.option_d,
        correct_option=question_data.correct_option.lower()
    )
    db.add(question)
    db.commit()
    db.refresh(quiz)
    return quiz


# ── GET QUIZ WITH ANSWERS (admin view) ─────────────────
@router.get("/programs/{program_id}/admin", response_model=QuizOutAdmin)
def get_quiz_admin(
    program_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    """Get quiz with correct answers — admin only"""
    quiz = db.query(Quiz).filter(
        Quiz.training_program_id == program_id
    ).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No quiz found for this program"
        )
    return quiz


# ── DELETE QUESTION ────────────────────────────────────
@router.delete("/{quiz_id}/questions/{question_id}")
def delete_question(
    quiz_id: int,
    question_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    """Delete a question from a quiz — admin only"""
    question = db.query(QuizQuestion).filter(
        QuizQuestion.id == question_id,
        QuizQuestion.quiz_id == quiz_id
    ).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    db.delete(question)
    db.commit()
    return {"message": "Question deleted successfully"}


# ══════════════════════════════════════════════════════
#  WORKER — TAKE QUIZ
# ══════════════════════════════════════════════════════

# ── GET QUIZ (worker view — no answers) ────────────────
@router.get("/programs/{program_id}", response_model=QuizOut)
def get_quiz_worker(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get quiz for a training program.
    Worker must have completed all videos first.
    Correct answers are hidden from workers.
    """

    # Check all videos are completed first
    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == program_id
    ).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )

    # Get all videos for this program
    videos = db.query(TrainingVideo).filter(
        TrainingVideo.training_program_id == program_id
    ).all()

    # Check every video is completed by this worker
    for video in videos:
        progress = db.query(VideoProgress).filter(
            VideoProgress.user_id == current_user.id,
            VideoProgress.video_id == video.id,
            VideoProgress.completed == True
        ).first()
        if not progress:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must complete all training videos before taking the quiz"
            )

    # Check attempts remaining
    quiz = db.query(Quiz).filter(
        Quiz.training_program_id == program_id
    ).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No quiz found for this program"
        )

    attempts_used = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.quiz_id == quiz.id
    ).count()

    if attempts_used >= program.max_attempts:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Maximum attempts ({program.max_attempts}) reached"
        )

    return quiz


# ── SUBMIT QUIZ ANSWERS ────────────────────────────────
@router.post("/programs/{program_id}/submit",
             response_model=QuizResultOut)
def submit_quiz(
    program_id: int,
    submission: QuizAnswerSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit quiz answers and get instant score.
    Score = (correct answers / total questions) * 100
    Pass mark is 70% by default.
    """

    # Get program and quiz
    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == program_id
    ).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )

    quiz = db.query(Quiz).filter(
        Quiz.training_program_id == program_id
    ).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No quiz found for this program"
        )

    # Check attempts
    previous_attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.quiz_id == quiz.id
    ).count()

    if previous_attempts >= program.max_attempts:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Maximum attempts ({program.max_attempts}) reached"
        )

    # Get all questions
    questions = db.query(QuizQuestion).filter(
        QuizQuestion.quiz_id == quiz.id
    ).all()

    if not questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This quiz has no questions yet"
        )

    # ── Score the answers ──────────────────────────────
    correct_count = 0
    for question in questions:
        submitted_answer = submission.answers.get(str(question.id))
        if submitted_answer and submitted_answer.lower() == question.correct_option:
            correct_count += 1

    total_questions = len(questions)
    score = (correct_count / total_questions) * 100
    passed = score >= program.pass_mark
    attempt_number = previous_attempts + 1
    attempts_remaining = program.max_attempts - attempt_number

    # ── Save the attempt ───────────────────────────────
    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score=score,
        passed=passed,
        attempt_number=attempt_number
    )
    db.add(attempt)
    db.commit()

    # ── Build response message ─────────────────────────
    if passed:
        message = (
            f"Congratulations! You passed with {score:.1f}%. "
            f"Your certificate will be generated shortly."
        )
    elif attempts_remaining > 0:
        message = (
            f"You scored {score:.1f}%. "
            f"Pass mark is {program.pass_mark}%. "
            f"You have {attempts_remaining} attempt(s) remaining."
        )
    else:
        message = (
            f"You scored {score:.1f}% and have used all "
            f"{program.max_attempts} attempts. "
            f"Please contact your supervisor."
        )

    return QuizResultOut(
        score=round(score, 1),
        passed=passed,
        attempt_number=attempt_number,
        attempts_remaining=attempts_remaining,
        correct_answers=correct_count,
        total_questions=total_questions,
        message=message
    )


# ── GET MY QUIZ ATTEMPTS ───────────────────────────────
@router.get("/my-attempts", response_model=List[QuizAttemptOut])
def get_my_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all quiz attempts for the current worker"""
    return db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).order_by(QuizAttempt.taken_at.desc()).all()