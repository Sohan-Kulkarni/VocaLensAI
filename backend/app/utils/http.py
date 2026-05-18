from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.interview import InterviewSession
from app.models.user import User


def get_owned_session(db: Session, session_id: int, user: User) -> InterviewSession:
    session = (
        db.query(InterviewSession)
        .filter(InterviewSession.id == session_id, InterviewSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")
    return session
