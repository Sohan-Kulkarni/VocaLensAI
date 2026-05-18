from datetime import date, datetime, time
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.ml.technical import DOMAIN_KEYWORDS
from app.ml.transcriber import SpeechTranscriber
from app.models.analysis import AnalysisResult
from app.models.interview import InterviewSession
from app.models.user import User
from app.schemas.interview import (
    CompareRequest,
    CompareResponse,
    CompareSessionPoint,
    InterviewSessionDetail,
    InterviewSessionRead,
    TextAnalysisRequest,
)
from app.services.analysis_service import create_analysis_session
from app.services.audio_storage import save_audio_upload
from app.utils.http import get_owned_session


router = APIRouter(prefix="/interviews", tags=["Interviews"])
transcriber = SpeechTranscriber()


def _validate_domain(domain: str) -> str:
    if domain not in DOMAIN_KEYWORDS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported domain. Choose one of: {', '.join(DOMAIN_KEYWORDS)}.",
        )
    return domain


def _to_session_read(session: InterviewSession) -> InterviewSessionRead:
    analysis = session.analysis
    return InterviewSessionRead(
        id=session.id,
        title=session.title,
        domain=session.domain,
        status=session.status,
        duration_seconds=session.duration_seconds,
        created_at=session.created_at,
        overall_score=analysis.overall_score if analysis else None,
        confidence_score=analysis.confidence_score if analysis else None,
        technical_score=analysis.technical_score if analysis else None,
        filler_count=analysis.filler_count if analysis else None,
        wpm=analysis.wpm if analysis else None,
    )


@router.post("/upload", response_model=InterviewSessionDetail, status_code=status.HTTP_201_CREATED)
async def upload_audio(
    title: str = Form("Practice Interview"),
    domain: str = Form("Software Engineering"),
    duration_seconds: float | None = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InterviewSession:
    domain = _validate_domain(domain)
    audio_path = await save_audio_upload(file)
    try:
        transcription = await run_in_threadpool(transcriber.transcribe, audio_path)
    except RuntimeError as exc:
        Path(audio_path).unlink(missing_ok=True)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    transcript_text = transcription["text"].strip()
    if not transcript_text:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No speech detected in audio.")

    resolved_duration = duration_seconds or transcription.get("duration_seconds") or 60
    return create_analysis_session(
        db=db,
        user=current_user,
        title=title,
        domain=domain,
        transcript_text=transcript_text,
        duration_seconds=resolved_duration,
        audio_path=audio_path,
    )


@router.post("/analyze-text", response_model=InterviewSessionDetail, status_code=status.HTTP_201_CREATED)
def analyze_text(
    payload: TextAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InterviewSession:
    return create_analysis_session(
        db=db,
        user=current_user,
        title=payload.title,
        domain=payload.domain,
        transcript_text=payload.transcript,
        duration_seconds=payload.duration_seconds,
    )


@router.get("/history", response_model=list[InterviewSessionRead])
def history(
    q: str | None = Query(default=None),
    domain: str | None = Query(default=None),
    min_score: float | None = Query(default=None, ge=0, le=100),
    max_score: float | None = Query(default=None, ge=0, le=100),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[InterviewSessionRead]:
    query = (
        db.query(InterviewSession)
        .outerjoin(AnalysisResult, AnalysisResult.session_id == InterviewSession.id)
        .filter(InterviewSession.user_id == current_user.id)
    )
    if q:
        query = query.filter(InterviewSession.title.ilike(f"%{q}%"))
    if domain:
        query = query.filter(InterviewSession.domain == domain)
    if min_score is not None:
        query = query.filter(AnalysisResult.overall_score >= min_score)
    if max_score is not None:
        query = query.filter(AnalysisResult.overall_score <= max_score)
    if from_date:
        query = query.filter(InterviewSession.created_at >= datetime.combine(from_date, time.min))
    if to_date:
        query = query.filter(InterviewSession.created_at <= datetime.combine(to_date, time.max))

    sessions = query.order_by(InterviewSession.created_at.desc()).all()
    return [_to_session_read(session) for session in sessions]


@router.post("/compare", response_model=CompareResponse)
def compare_sessions(
    payload: CompareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CompareResponse:
    sessions = [get_owned_session(db, session_id, current_user) for session_id in payload.session_ids]
    points: list[CompareSessionPoint] = []
    for session in sessions:
        if not session.analysis:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Every session needs analysis.")
        points.append(
            CompareSessionPoint(
                session_id=session.id,
                title=session.title,
                created_at=session.created_at,
                overall_score=session.analysis.overall_score,
                confidence_score=session.analysis.confidence_score,
                communication_score=session.analysis.communication_score,
                technical_score=session.analysis.technical_score,
                grammar_score=session.analysis.grammar_score,
                fluency_score=session.analysis.fluency_score,
            )
        )

    first, last = points[0], points[-1]
    deltas = {
        "overall_score": round(last.overall_score - first.overall_score, 2),
        "confidence_score": round(last.confidence_score - first.confidence_score, 2),
        "communication_score": round(last.communication_score - first.communication_score, 2),
        "technical_score": round(last.technical_score - first.technical_score, 2),
    }
    return CompareResponse(sessions=points, deltas=deltas)


@router.get("/{session_id}", response_model=InterviewSessionDetail)
def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InterviewSession:
    return get_owned_session(db, session_id, current_user)


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    session = get_owned_session(db, session_id, current_user)
    if session.audio_path:
        Path(session.audio_path).unlink(missing_ok=True)
    db.delete(session)
    db.commit()
