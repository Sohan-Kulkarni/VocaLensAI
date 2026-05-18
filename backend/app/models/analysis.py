from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.database import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), unique=True, nullable=False)
    overall_score = Column(Float, default=0.0, nullable=False)
    confidence_score = Column(Float, default=0.0, nullable=False)
    communication_score = Column(Float, default=0.0, nullable=False)
    technical_score = Column(Float, default=0.0, nullable=False)
    grammar_score = Column(Float, default=0.0, nullable=False)
    fluency_score = Column(Float, default=0.0, nullable=False)
    sentiment_label = Column(String(40), default="neutral", nullable=False)
    sentiment_score = Column(Float, default=0.0, nullable=False)
    wpm = Column(Float, default=0.0, nullable=False)
    filler_count = Column(Integer, default=0, nullable=False)
    filler_density = Column(Float, default=0.0, nullable=False)
    filler_severity = Column(String(40), default="low", nullable=False)
    pause_score = Column(Float, default=0.0, nullable=False)
    strengths = Column(JSON, default=list, nullable=False)
    weaknesses = Column(JSON, default=list, nullable=False)
    suggestions = Column(JSON, default=list, nullable=False)
    keyword_hits = Column(JSON, default=list, nullable=False)
    missing_keywords = Column(JSON, default=list, nullable=False)
    radar_scores = Column(JSON, default=dict, nullable=False)
    charts = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    session = relationship("InterviewSession", back_populates="analysis")
