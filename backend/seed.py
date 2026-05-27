from app.database import SessionLocal
from app.models.models import JobRole

db = SessionLocal()

roles = [
    JobRole(name='Electrician', description='Electrical installation and maintenance'),
    JobRole(name='Driver', description='Vehicle and machinery operators'),
    JobRole(name='General Worker', description='General construction labour'),
    JobRole(name='Plumber', description='Plumbing installation and maintenance'),
    JobRole(name='Supervisor', description='Site supervision and management'),
]

db.add_all(roles)
db.commit()
db.close()
print('Job roles added successfully!')