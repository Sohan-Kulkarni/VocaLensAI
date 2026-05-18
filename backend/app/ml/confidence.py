from app.ml.filler import FillerAnalysis
from app.ml.scoring import CommunicationScores
from app.ml.sentiment import SentimentResult


def estimate_confidence(
    sentiment: SentimentResult,
    filler: FillerAnalysis,
    communication: CommunicationScores,
    grammar_score: float,
) -> float:
    sentiment_component = 62 + sentiment.compound * 22
    confidence = (
        sentiment_component * 0.22
        + filler.score * 0.22
        + communication.wpm_score * 0.18
        + communication.pause_score * 0.14
        + communication.fluency_score * 0.14
        + grammar_score * 0.10
    )
    return round(max(0, min(100, confidence)), 2)
