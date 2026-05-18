from dataclasses import asdict

from app.ml.confidence import estimate_confidence
from app.ml.filler import analyze_fillers
from app.ml.preprocessing import extract_text_features, grammar_quality_score
from app.ml.scoring import score_communication
from app.ml.sentiment import analyze_sentiment
from app.ml.technical import analyze_technical_relevance


def analyze_interview_text(text: str, duration_seconds: float, domain: str) -> dict:
    features = extract_text_features(text)
    filler = analyze_fillers(text, features.word_count)
    sentiment = analyze_sentiment(text, features.words)
    technical = analyze_technical_relevance(text, domain)
    grammar_score = grammar_quality_score(features)
    communication = score_communication(text, features, duration_seconds, filler, grammar_score)
    confidence = estimate_confidence(sentiment, filler, communication, grammar_score)
    overall = (
        communication.communication_score * 0.32
        + confidence * 0.24
        + technical.score * 0.24
        + grammar_score * 0.12
        + communication.fluency_score * 0.08
    )

    radar_scores = {
        "Communication": communication.communication_score,
        "Confidence": confidence,
        "Technical": technical.score,
        "Grammar": grammar_score,
        "Fluency": communication.fluency_score,
    }

    charts = {
        "filler_frequency": filler.frequency,
        "wpm_series": [
            {"label": "Current", "wpm": communication.wpm},
            {"label": "Target Low", "wpm": 120},
            {"label": "Target High", "wpm": 165},
        ],
        "sentiment_series": [
            {"label": "Negative", "score": max(0, 50 - sentiment.score)},
            {"label": "Neutral", "score": 100 - abs(sentiment.score - 50) * 2},
            {"label": "Positive", "score": max(0, sentiment.score - 50)},
        ],
        "domain_coverage": technical.topic_coverage,
        "wpm_feedback": communication.wpm_feedback,
        "raw": {
            "features": asdict(features),
            "filler": asdict(filler),
            "sentiment": asdict(sentiment),
            "technical": asdict(technical),
            "communication": asdict(communication),
        },
    }

    return {
        "word_count": features.word_count,
        "overall_score": round(max(0, min(100, overall)), 2),
        "confidence_score": confidence,
        "communication_score": communication.communication_score,
        "technical_score": technical.score,
        "grammar_score": grammar_score,
        "fluency_score": communication.fluency_score,
        "sentiment_label": sentiment.label,
        "sentiment_score": sentiment.score,
        "wpm": communication.wpm,
        "filler_count": filler.total_count,
        "filler_density": filler.density_per_100_words,
        "filler_severity": filler.severity,
        "pause_score": communication.pause_score,
        "keyword_hits": technical.keyword_hits,
        "missing_keywords": technical.missing_keywords,
        "radar_scores": radar_scores,
        "charts": charts,
    }
