from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.report import TranscriptSummary
from app.services.report_service import generate_pdf_report, summarize_transcript
from app.utils.http import get_owned_session


router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/{session_id}/pdf")
def pdf_report(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FileResponse:
    session = get_owned_session(db, session_id, current_user)
    pdf_path = generate_pdf_report(session)
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"interview-report-{session_id}.pdf",
    )


@router.get("/{session_id}/summary", response_model=TranscriptSummary)
def transcript_summary(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    session = get_owned_session(db, session_id, current_user)
    return summarize_transcript(session)
