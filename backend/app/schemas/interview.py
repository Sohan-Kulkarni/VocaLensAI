from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


DomainName = Literal[
    "Software Engineering",
    "AI/ML",
    "Data Science",
    "Web Development",
    "Cloud/DevOps",
]


class TextAnalysisRequest(BaseModel):
    title: str = Field(default="Practice Interview", min_length=2, max_length=160)
    domain: DomainName = "Software Engineering"
    transcript: str = Field(..., min_length=20)
    duration_seconds: float = Field(default=120, ge=10)


class CompareRequest(BaseModel):
    session_ids: list[int] = Field(..., min_length=2, max_length=4)


class TranscriptRead(BaseModel):
    id: int
    text: str
    language: str
    duration_seconds: float
    word_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnalysisRead(BaseModel):
    id: int
    overall_score: float
    confidence_score: float
    communication_score: float
    technical_score: float
    grammar_score: float
    fluency_score: float
    sentiment_label: str
    sentiment_score: float
    wpm: float
    filler_count: int
    filler_density: float
    filler_severity: str
    pause_score: float
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]
    keyword_hits: list[str]
    missing_keywords: list[str]
    radar_scores: dict[str, float]
    charts: dict
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InterviewSessionRead(BaseModel):
    id: int
    title: str
    domain: str
    status: str
    duration_seconds: float
    created_at: datetime
    overall_score: float | None = None
    confidence_score: float | None = None
    technical_score: float | None = None
    filler_count: int | None = None
    wpm: float | None = None

    model_config = ConfigDict(from_attributes=True)


class InterviewSessionDetail(BaseModel):
    id: int
    title: str
    domain: str
    status: str
    audio_path: str | None
    duration_seconds: float
    created_at: datetime
    transcript: TranscriptRead | None
    analysis: AnalysisRead | None

    model_config = ConfigDict(from_attributes=True)


class CompareSessionPoint(BaseModel):
    session_id: int
    title: str
    created_at: datetime
    overall_score: float
    confidence_score: float
    communication_score: float
    technical_score: float
    grammar_score: float
    fluency_score: float


class CompareResponse(BaseModel):
    sessions: list[CompareSessionPoint]
    deltas: dict[str, float]
