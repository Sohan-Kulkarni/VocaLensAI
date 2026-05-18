from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.analysis import AnalysisResult
from app.models.interview import InterviewSession
from app.models.user import User
from app.schemas.user import UserProfile


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserProfile)
def profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserProfile:
    stats = (
        db.query(func.count(InterviewSession.id), func.avg(AnalysisResult.overall_score))
        .outerjoin(AnalysisResult, AnalysisResult.session_id == InterviewSession.id)
        .filter(InterviewSession.user_id == current_user.id)
        .first()
    )
    total_sessions = int(stats[0] or 0)
    average_score = round(float(stats[1] or 0.0), 2)
    data = UserProfile.model_validate(current_user).model_dump()
    data.update({"total_sessions": total_sessions, "average_score": average_score})
    return UserProfile(**data)
