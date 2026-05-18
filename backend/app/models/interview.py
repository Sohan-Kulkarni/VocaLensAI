from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(160), nullable=False)
    domain = Column(String(80), nullable=False)
    status = Column(String(40), default="completed", nullable=False)
    audio_path = Column(String(500), nullable=True)
    duration_seconds = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="sessions")
    transcript = relationship("Transcript", back_populates="session", cascade="all, delete-orphan", uselist=False)
    analysis = relationship("AnalysisResult", back_populates="session", cascade="all, delete-orphan", uselist=False)
