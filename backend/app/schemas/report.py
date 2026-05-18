from pydantic import BaseModel


class TranscriptSummary(BaseModel):
    session_id: int
    title: str
    summary: str
    key_takeaways: list[str]
