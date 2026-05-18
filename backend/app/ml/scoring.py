from dataclasses import dataclass

from app.ml.filler import FillerAnalysis
from app.ml.preprocessing import TextFeatures


@dataclass(frozen=True)
class CommunicationScores:
    wpm: float
    wpm_feedback: str
    wpm_score: float
    pause_score: float
    grammar_score: float
    fluency_score: float
    communication_score: float


def calculate_wpm(word_count: int, duration_seconds: float) -> float:
    minutes = max(duration_seconds / 60, 0.25)
    return round(word_count / minutes, 2)


def score_wpm(wpm: float) -> tuple[float, str]:
    if wpm < 95:
        return max(45, 100 - (95 - wpm) * 0.8), "too slow"
    if wpm > 185:
        return max(45, 100 - (wpm - 185) * 0.6), "too fast"
    if 120 <= wpm <= 165:
        return 100.0, "optimal"
    return 88.0, "acceptable"


def estimate_pause_score(text: str, duration_seconds: float, word_count: int) -> float:
    pause_markers = text.count("...") + text.count("--") + text.lower().count("[pause]")
    expected_duration = max(word_count / 145 * 60, 1)
    pacing_gap = abs(duration_seconds - expected_duration) / expected_duration
    score = 100 - pause_markers * 8 - pacing_gap * 18
    return round(max(0, min(100, score)), 2)


def score_communication(
    text: str,
    features: TextFeatures,
    duration_seconds: float,
    filler: FillerAnalysis,
    grammar_score: float,
) -> CommunicationScores:
    wpm = calculate_wpm(features.word_count, duration_seconds)
    wpm_score, feedback = score_wpm(wpm)
    pause_score = estimate_pause_score(text, duration_seconds, features.word_count)

    sentence_balance = 100 - min(abs(features.avg_sentence_length - 16) * 2.2, 35)
    fluency_score = (
        wpm_score * 0.34
        + filler.score * 0.28
        + pause_score * 0.22
        + max(0, sentence_balance) * 0.16
    )
    communication_score = (
        fluency_score * 0.46
        + grammar_score * 0.28
        + filler.score * 0.16
        + wpm_score * 0.10
    )

    return CommunicationScores(
        wpm=wpm,
        wpm_feedback=feedback,
        wpm_score=round(wpm_score, 2),
        pause_score=pause_score,
        grammar_score=round(grammar_score, 2),
        fluency_score=round(max(0, min(100, fluency_score)), 2),
        communication_score=round(max(0, min(100, communication_score)), 2),
    )
