from dataclasses import dataclass


POSITIVE_TERMS = {
    "confident",
    "clear",
    "success",
    "improved",
    "built",
    "led",
    "solved",
    "optimized",
    "effective",
    "collaborated",
    "delivered",
    "learned",
}
NEGATIVE_TERMS = {
    "failed",
    "confused",
    "difficult",
    "weak",
    "problem",
    "issue",
    "stuck",
    "uncertain",
    "nervous",
    "mistake",
}


@dataclass(frozen=True)
class SentimentResult:
    label: str
    compound: float
    score: float


def analyze_sentiment(text: str, words: list[str]) -> SentimentResult:
    try:
        from nltk.sentiment import SentimentIntensityAnalyzer

        analyzer = SentimentIntensityAnalyzer()
        compound = analyzer.polarity_scores(text)["compound"]
    except Exception:
        positive = sum(1 for word in words if word in POSITIVE_TERMS)
        negative = sum(1 for word in words if word in NEGATIVE_TERMS)
        compound = (positive - negative) / max(positive + negative, 1)

    if compound >= 0.15:
        label = "positive"
    elif compound <= -0.15:
        label = "negative"
    else:
        label = "neutral"

    score = round((compound + 1) * 50, 2)
    return SentimentResult(label=label, compound=round(compound, 3), score=score)
