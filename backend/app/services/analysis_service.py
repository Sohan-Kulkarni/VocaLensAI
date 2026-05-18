from sqlalchemy.orm import Session

from app.ml.pipeline import analyze_interview_text
from app.models.analysis import AnalysisResult
from app.models.interview import InterviewSession
from app.models.transcript import Transcript
from app.models.user import User
from app.services.feedback_service import generate_feedback


def create_analysis_session(
    db: Session,
    user: User,
    title: str,
    domain: str,
    transcript_text: str,
    duration_seconds: float,
    audio_path: str | None = None,
) -> InterviewSession:
    metrics = analyze_interview_text(transcript_text, duration_seconds, domain)
    feedback = generate_feedback(metrics, domain)

    session = InterviewSession(
        user_id=user.id,
        title=title,
        domain=domain,
        audio_path=audio_path,
        duration_seconds=duration_seconds,
        status="completed",
    )
    db.add(session)
    db.flush()

    transcript = Transcript(
        session_id=session.id,
        text=transcript_text,
        language="en",
        duration_seconds=duration_seconds,
        word_count=metrics["word_count"],
    )
    analysis = AnalysisResult(
        session_id=session.id,
        overall_score=metrics["overall_score"],
        confidence_score=metrics["confidence_score"],
        communication_score=metrics["communication_score"],
        technical_score=metrics["technical_score"],
        grammar_score=metrics["grammar_score"],
        fluency_score=metrics["fluency_score"],
        sentiment_label=metrics["sentiment_label"],
        sentiment_score=metrics["sentiment_score"],
        wpm=metrics["wpm"],
        filler_count=metrics["filler_count"],
        filler_density=metrics["filler_density"],
        filler_severity=metrics["filler_severity"],
        pause_score=metrics["pause_score"],
        strengths=feedback["strengths"],
        weaknesses=feedback["weaknesses"],
        suggestions=feedback["suggestions"],
        keyword_hits=metrics["keyword_hits"],
        missing_keywords=metrics["missing_keywords"],
        radar_scores=metrics["radar_scores"],
        charts=metrics["charts"],
    )
    db.add_all([transcript, analysis])
    db.commit()
    db.refresh(session)
    return session
