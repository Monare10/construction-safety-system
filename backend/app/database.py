from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load the .env file explicitly
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")

# This will help us debug if DATABASE_URL is still None
if DATABASE_URL is None:
    raise ValueError("DATABASE_URL is not set. Check your .env file.")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()