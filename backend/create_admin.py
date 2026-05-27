from app.database import SessionLocal
from app.models.models import User
from app.utils.auth import hash_password

db = SessionLocal()

admin = User(
    full_name="Safety Officer",
    email="admin@safety.com",
    password_hash=hash_password("admin123"),
    role="admin",
    is_eligible=True
)

db.add(admin)
db.commit()
db.refresh(admin)
print(f"Admin created! ID: {admin.id}, Email: {admin.email}, Role: {admin.role}")
db.close()