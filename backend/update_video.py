from app.database import SessionLocal
from app.models.models import TrainingVideo

db = SessionLocal()

video = db.query(TrainingVideo).filter(TrainingVideo.id == 1).first()

if video:
    video.video_url = 'https://www.youtube.com/watch?v=eqvn63FIhbE'
    video.duration_seconds = 600
    db.commit()
    print(f'Video updated! New URL: {video.video_url}')
else:
    print('Video not found')

db.close()