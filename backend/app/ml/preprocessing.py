import re
from dataclasses import dataclass


WORD_RE = re.compile(r"\b[a-zA-Z][a-zA-Z0-9+#.\-']*\b")
SENTENCE_RE = re.compile(r"(?<=[.!?])\s+")


@dataclass(frozen=True)
class TextFeatures:
    cleaned_text: str
    words: list[str]
    sentences: list[str]
    word_count: int
    sentence_count: int
    avg_sentence_length: float


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    return text


def tokenize_words(text: str) -> list[str]:
    return [match.group(0).lower() for match in WORD_RE.finditer(text)]


def split_sentences(text: str) -> list[str]:
    text = clean_text(text)
    if not text:
        return []
    sentences = [sentence.strip() for sentence in SENTENCE_RE.split(text) if sentence.strip()]
    return sentences or [text]


def extract_text_features(text: str) -> TextFeatures:
    cleaned = clean_text(text)
    words = tokenize_words(cleaned)
    sentences = split_sentences(cleaned)
    avg_sentence_length = len(words) / max(len(sentences), 1)
    return TextFeatures(
        cleaned_text=cleaned,
        words=words,
        sentences=sentences,
        word_count=len(words),
        sentence_count=len(sentences),
        avg_sentence_length=avg_sentence_length,
    )


def grammar_quality_score(features: TextFeatures) -> float:
    if not features.cleaned_text:
        return 0.0

    sentence_lengths = [len(tokenize_words(sentence)) for sentence in features.sentences]
    run_on_penalty = sum(1 for length in sentence_lengths if length > 32) * 8
    fragment_penalty = sum(1 for length in sentence_lengths if 0 < length < 4) * 6
    lowercase_starts = sum(
        1 for sentence in features.sentences if sentence and sentence[0].isalpha() and sentence[0].islower()
    )
    capitalization_penalty = lowercase_starts * 3
    repeated_words = sum(
        1 for index in range(1, len(features.words)) if features.words[index] == features.words[index - 1]
    )

    score = 92 - run_on_penalty - fragment_penalty - capitalization_penalty - repeated_words * 4
    if 9 <= features.avg_sentence_length <= 24:
        score += 5
    return round(max(0, min(100, score)), 2)
