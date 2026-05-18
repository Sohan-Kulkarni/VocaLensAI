def generate_feedback(metrics: dict, domain: str) -> dict[str, list[str]]:
    strengths: list[str] = []
    weaknesses: list[str] = []
    suggestions: list[str] = []

    if metrics["communication_score"] >= 78:
        strengths.append("Your answer is structured clearly and easy to follow.")
    else:
        weaknesses.append("Your communication structure needs clearer opening, evidence, and closing points.")
        suggestions.append("Use a short STAR structure: situation, task, action, result.")

    if metrics["confidence_score"] >= 75:
        strengths.append("Your delivery signals confidence through pacing and low hesitation.")
    else:
        weaknesses.append("Confidence indicators are reduced by pacing, filler words, or uncertain language.")
        suggestions.append("Practice the same answer twice: once slowly for structure, once at interview pace.")

    if metrics["technical_score"] >= 70:
        strengths.append(f"Your response includes relevant {domain} terminology.")
    else:
        weaknesses.append(f"The answer could connect more strongly to {domain} concepts.")
        missing = ", ".join(metrics.get("missing_keywords", [])[:4])
        if missing:
            suggestions.append(f"Add concrete technical details around: {missing}.")

    if metrics["filler_count"] > 6 or metrics["filler_severity"] == "high":
        weaknesses.append("Filler words are frequent enough to distract from the message.")
        suggestions.append("Pause silently for one beat instead of using filler words while thinking.")
    else:
        strengths.append("Filler word usage is controlled.")

    wpm = metrics["wpm"]
    if wpm < 95:
        suggestions.append("Increase energy slightly; aim for 120 to 165 words per minute.")
    elif wpm > 185:
        suggestions.append("Slow down and use shorter sentences so the interviewer can process details.")
    else:
        strengths.append("Your speaking speed is within a professional interview range.")

    if metrics["grammar_score"] < 70:
        weaknesses.append("Sentence quality can be improved for more polished delivery.")
        suggestions.append("Rewrite long sentences into two shorter statements before practicing aloud.")

    if metrics["overall_score"] >= 82:
        suggestions.append("You are close to interview-ready. Add one measurable outcome to make the answer sharper.")
    elif metrics["overall_score"] >= 65:
        suggestions.append("You have a solid base. Improve specificity and reduce hesitation for a stronger impression.")
    else:
        suggestions.append("Focus first on a concise answer outline, then layer in technical evidence.")

    return {
        "strengths": strengths[:5],
        "weaknesses": weaknesses[:5],
        "suggestions": suggestions[:6],
    }
