from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import (
    VideoProgress, TrainingVideo,
    TrainingProgram, User
)
from app.schemas.schemas import (
    VideoProgressUpdate, VideoProgressOut,
    TrainingStatusOut, VideoStatusOut
)
from app.utils.auth import get_current_user

router = APIRouter(prefix="/progress", tags=["Video Progress"])


# ── UPDATE VIDEO PROGRESS ──────────────────────────────
@router.post("/video/{video_id}", response_model=VideoProgressOut)
def update_video_progress(
    video_id: int,
    progress_data: VideoProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save how many seconds a worker has watched.
    Call this every 10-15 seconds while the video is playing.
    Automatically marks video as completed when fully watched.
    """

    # Check video exists
    video = db.query(TrainingVideo).filter(
        TrainingVideo.id == video_id
    ).first()

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    # Check if progress record already exists for this user + video
    progress = db.query(VideoProgress).filter(
        VideoProgress.user_id == current_user.id,
        VideoProgress.video_id == video_id
    ).first()

    if progress:
        # Update existing progress — never go backwards
        if progress_data.watched_seconds > progress.watched_seconds:
            progress.watched_seconds = progress_data.watched_seconds
    else:
        # Create new progress record
        progress = VideoProgress(
            user_id=current_user.id,
            video_id=video_id,
            watched_seconds=progress_data.watched_seconds,
            completed=False
        )
        db.add(progress)

    # Mark as completed if worker watched at least 90% of the video
    if video.duration_seconds > 0:
        percentage_watched = (progress.watched_seconds / video.duration_seconds) * 100
        if percentage_watched >= 90:
            progress.completed = True

    db.commit()
    db.refresh(progress)
    return progress


# ── GET VIDEO PROGRESS ─────────────────────────────────
@router.get("/video/{video_id}", response_model=VideoProgressOut)
def get_video_progress(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current user's progress for a specific video"""

    progress = db.query(VideoProgress).filter(
        VideoProgress.user_id == current_user.id,
        VideoProgress.video_id == video_id
    ).first()

    if not progress:
        # Return zero progress if never started
        return VideoProgressOut(
            id=0,
            user_id=current_user.id,
            video_id=video_id,
            watched_seconds=0,
            completed=False
        )

    return progress


# ── GET TRAINING STATUS FOR A PROGRAM ─────────────────
@router.get("/training/{program_id}", response_model=TrainingStatusOut)
def get_training_status(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a worker's full training status for a program.
    Shows progress per video and whether they're ready for the quiz.
    """

    # Get the training program
    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == program_id
    ).first()

    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )

    # Get all videos for this program ordered correctly
    videos = db.query(TrainingVideo).filter(
        TrainingVideo.training_program_id == program_id
    ).order_by(TrainingVideo.order_index).all()

    # Build status for each video
    video_statuses = []
    completed_count = 0

    for video in videos:
        progress = db.query(VideoProgress).filter(
            VideoProgress.user_id == current_user.id,
            VideoProgress.video_id == video.id
        ).first()

        watched = progress.watched_seconds if progress else 0
        completed = progress.completed if progress else False

        if completed:
            completed_count += 1

        video_statuses.append(VideoStatusOut(
            video_id=video.id,
            title=video.title,
            duration_seconds=video.duration_seconds,
            watched_seconds=watched,
            completed=completed
        ))

    total_videos = len(videos)
    all_completed = completed_count == total_videos and total_videos > 0

    return TrainingStatusOut(
        program_id=program.id,
        program_title=program.title,
        total_videos=total_videos,
        completed_videos=completed_count,
        all_videos_completed=all_completed,
        ready_for_quiz=all_completed,
        videos=video_statuses
    )


# ── GET ALL MY PROGRESS (worker dashboard) ─────────────
@router.get("/my-progress", response_model=List[TrainingStatusOut])
def get_my_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get training status for ALL programs assigned to the worker.
    Used for the worker dashboard.
    """

    if not current_user.job_role_id:
        return []

    # Get all programs for this worker's job role
    programs = db.query(TrainingProgram).filter(
        TrainingProgram.job_role_id == current_user.job_role_id
    ).all()

    all_statuses = []

    for program in programs:
        videos = db.query(TrainingVideo).filter(
            TrainingVideo.training_program_id == program.id
        ).order_by(TrainingVideo.order_index).all()

        video_statuses = []
        completed_count = 0

        for video in videos:
            progress = db.query(VideoProgress).filter(
                VideoProgress.user_id == current_user.id,
                VideoProgress.video_id == video.id
            ).first()

            watched = progress.watched_seconds if progress else 0
            completed = progress.completed if progress else False

            if completed:
                completed_count += 1

            video_statuses.append(VideoStatusOut(
                video_id=video.id,
                title=video.title,
                duration_seconds=video.duration_seconds,
                watched_seconds=watched,
                completed=completed
            ))

        total_videos = len(videos)
        all_completed = completed_count == total_videos and total_videos > 0

        all_statuses.append(TrainingStatusOut(
            program_id=program.id,
            program_title=program.title,
            total_videos=total_videos,
            completed_videos=completed_count,
            all_videos_completed=all_completed,
            ready_for_quiz=all_completed,
            videos=video_statuses
        ))

    return all_statuses