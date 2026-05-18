import re
from dataclasses import dataclass


FILLER_WORDS = [
    "um",
    "uh",
    "erm",
    "ah",
    "like",
    "basically",
    "actually",
    "literally",
    "sort of",
    "kind of",
    "you know",
    "i mean",
    "right",
    "okay",
]


@dataclass(frozen=True)
class FillerAnalysis:
    total_count: int
    frequency: dict[str, int]
    density_per_100_words: float
    severity: str
    score: float


def analyze_fillers(text: str, word_count: int) -> FillerAnalysis:
    lowered = f" {text.lower()} "
    frequency: dict[str, int] = {}
    for filler in FILLER_WORDS:
        pattern = r"(?<![a-zA-Z])" + re.escape(filler) + r"(?![a-zA-Z])"
        count = len(re.findall(pattern, lowered))
        if count:
            frequency[filler] = count

    total = sum(frequency.values())
    density = round((total / max(word_count, 1)) * 100, 2)
    if density < 1.5:
        severity = "low"
    elif density < 4:
        severity = "moderate"
    else:
        severity = "high"

    score = round(max(0, 100 - density * 12), 2)
    return FillerAnalysis(
        total_count=total,
        frequency=frequency,
        density_per_100_words=density,
        severity=severity,
        score=score,
    )
