import re
from dataclasses import dataclass


DOMAIN_KEYWORDS: dict[str, list[str]] = {
    "Software Engineering": [
        "algorithm",
        "data structure",
        "system design",
        "api",
        "database",
        "testing",
        "scalability",
        "microservice",
        "design pattern",
        "complexity",
        "cache",
        "concurrency",
        "ci/cd",
        "observability",
    ],
    "AI/ML": [
        "model",
        "training",
        "inference",
        "feature engineering",
        "validation",
        "overfitting",
        "gradient",
        "neural network",
        "transformer",
        "embedding",
        "classification",
        "regression",
        "evaluation",
        "precision",
        "recall",
    ],
    "Data Science": [
        "dataset",
        "statistics",
        "hypothesis",
        "visualization",
        "cleaning",
        "correlation",
        "regression",
        "classification",
        "feature",
        "experiment",
        "metric",
        "sampling",
        "dashboard",
        "insight",
    ],
    "Web Development": [
        "react",
        "frontend",
        "backend",
        "api",
        "state management",
        "accessibility",
        "routing",
        "component",
        "database",
        "authentication",
        "responsive",
        "performance",
        "security",
        "deployment",
    ],
    "Cloud/DevOps": [
        "docker",
        "kubernetes",
        "ci/cd",
        "pipeline",
        "monitoring",
        "logging",
        "autoscaling",
        "load balancer",
        "cloud",
        "terraform",
        "container",
        "deployment",
        "infrastructure",
        "security",
    ],
}


@dataclass(frozen=True)
class TechnicalResult:
    score: float
    keyword_hits: list[str]
    missing_keywords: list[str]
    topic_coverage: float


def _contains_keyword(text: str, keyword: str) -> bool:
    pattern = r"(?<![a-zA-Z0-9])" + re.escape(keyword.lower()) + r"(?![a-zA-Z0-9])"
    return bool(re.search(pattern, text.lower()))


def analyze_technical_relevance(text: str, domain: str) -> TechnicalResult:
    keywords = DOMAIN_KEYWORDS.get(domain, DOMAIN_KEYWORDS["Software Engineering"])
    hits = sorted({keyword for keyword in keywords if _contains_keyword(text, keyword)})
    missing = [keyword for keyword in keywords if keyword not in hits]
    coverage = len(hits) / max(len(keywords), 1)

    # A concise interview answer rarely uses every keyword. This rewards meaningful coverage
    # while avoiding a checklist-only score.
    score = min(100, coverage * 135 + min(len(hits), 6) * 3)
    return TechnicalResult(
        score=round(score, 2),
        keyword_hits=hits,
        missing_keywords=missing[:8],
        topic_coverage=round(coverage * 100, 2),
    )
