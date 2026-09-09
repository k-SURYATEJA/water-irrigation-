"""
Database setup for Python FastAPI backend using SQLite.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..models.models import Base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend_irrigation.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
