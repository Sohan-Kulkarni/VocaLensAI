from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.config.settings import get_settings
from app.models.interview import InterviewSession


def summarize_transcript(session: InterviewSession) -> dict:
    transcript = session.transcript.text if session.transcript else ""
    sentences = [item.strip() for item in transcript.replace("?", ".").replace("!", ".").split(".") if item.strip()]
    summary = ". ".join(sentences[:3])
    if summary and not summary.endswith("."):
        summary += "."

    key_takeaways = []
    if session.analysis:
        key_takeaways.extend(session.analysis.strengths[:2])
        key_takeaways.extend(session.analysis.suggestions[:2])

    return {
        "session_id": session.id,
        "title": session.title,
        "summary": summary or "No transcript summary is available yet.",
        "key_takeaways": key_takeaways[:4],
    }


def generate_pdf_report(session: InterviewSession) -> Path:
    settings = get_settings()
    output_path = settings.report_dir / f"interview-report-{session.id}.pdf"
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph(escape(f"VocaLens AI Interview Report: {session.title}"), styles["Title"]))
    story.append(Spacer(1, 0.18 * inch))
    story.append(Paragraph(escape(f"Domain: {session.domain}"), styles["Normal"]))
    story.append(Paragraph(escape(f"Created: {session.created_at}"), styles["Normal"]))
    story.append(Spacer(1, 0.2 * inch))

    analysis = session.analysis
    if analysis:
        metric_rows = [
            ["Metric", "Score"],
            ["Overall", f"{analysis.overall_score:.1f}/100"],
            ["Confidence", f"{analysis.confidence_score:.1f}/100"],
            ["Communication", f"{analysis.communication_score:.1f}/100"],
            ["Technical", f"{analysis.technical_score:.1f}/100"],
            ["Grammar", f"{analysis.grammar_score:.1f}/100"],
            ["Fluency", f"{analysis.fluency_score:.1f}/100"],
            ["WPM", f"{analysis.wpm:.1f}"],
            ["Filler Words", str(analysis.filler_count)],
        ]
        table = Table(metric_rows, hAlign="LEFT")
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#121826")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#9aa4b2")),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("PADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        story.append(table)
        story.append(Spacer(1, 0.22 * inch))

        for heading, items in [
            ("Strengths", analysis.strengths),
            ("Weaknesses", analysis.weaknesses),
            ("Improvement Suggestions", analysis.suggestions),
            ("Keyword Hits", analysis.keyword_hits),
            ("Missing Keywords", analysis.missing_keywords),
        ]:
            story.append(Paragraph(escape(heading), styles["Heading2"]))
            if items:
                for item in items:
                    story.append(Paragraph(f"- {escape(str(item))}", styles["BodyText"]))
            else:
                story.append(Paragraph("No items available.", styles["BodyText"]))
            story.append(Spacer(1, 0.1 * inch))

    if session.transcript:
        story.append(Paragraph("Transcript", styles["Heading2"]))
        story.append(Paragraph(escape(session.transcript.text[:3500]), styles["BodyText"]))

    doc = SimpleDocTemplate(str(output_path), pagesize=A4)
    doc.build(story)
    return output_path
