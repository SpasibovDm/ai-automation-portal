from __future__ import annotations

from dataclasses import dataclass

from app.models.email_message import EmailMessage
from app.models.company import Company
from sqlalchemy.orm import Session

from app.services.auto_reply_service import generate_reply, get_template


@dataclass(frozen=True)
class EmailAnalysisResult:
    category: str
    priority: str
    summary: str
    confidence: int
    ai_reply_suggestion: str


CATEGORY_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("Lead", ("pricing", "demo", "trial", "quote", "signup", "sales", "buy", "purchase")),
    ("Support", ("help", "issue", "error", "bug", "problem", "support", "not working")),
    ("Billing", ("invoice", "billing", "refund", "charge", "payment", "receipt")),
]

PRIORITY_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("high", ("urgent", "asap", "immediately", "critical", "outage", "down")),
    ("medium", ("soon", "priority", "important", "follow up", "follow-up")),
]


def _normalize_text(subject: str, body: str) -> str:
    return f"{subject} {body}".lower()


def classify_category(subject: str, body: str) -> tuple[str, int]:
    text = _normalize_text(subject, body)
    for category, keywords in CATEGORY_RULES:
        if any(keyword in text for keyword in keywords):
            return category, 88
    return "Other", 72


def classify_priority(subject: str, body: str) -> str:
    text = _normalize_text(subject, body)
    for priority, keywords in PRIORITY_RULES:
        if any(keyword in text for keyword in keywords):
            return priority
    return "low"


def summarize_email(body: str, max_length: int = 180) -> str:
    text = " ".join(body.strip().split())
    if not text:
        return "No message body provided."
    if len(text) <= max_length:
        return text
    truncated = text[: max_length - 1]
    if "." in truncated:
        return truncated.rsplit(".", 1)[0].strip() + "."
    return truncated.strip() + "..."


def build_reply_suggestion(
    db: Session,
    email: EmailMessage,
    company: Company | None,
) -> str:
    context = {
        "email": email.from_email,
        "subject": email.subject,
        "body": email.body,
    }
    if company:
        template = get_template(db, "email", company.id)
        if template:
            reply = generate_reply(template, context)
            return reply["body"]
    return (
        "Thanks for reaching out! We've received your message and will follow up shortly with next steps. "
        "If you have any additional details, feel free to reply to this email."
    )


def analyze_email(
    db: Session,
    email: EmailMessage,
    company: Company | None = None,
) -> EmailAnalysisResult:
    category, confidence = classify_category(email.subject, email.body)
    priority = classify_priority(email.subject, email.body)
    summary = summarize_email(email.body)
    suggestion = build_reply_suggestion(db, email, company)
    return EmailAnalysisResult(
        category=category,
        priority=priority,
        summary=summary,
        confidence=confidence,
        ai_reply_suggestion=suggestion,
    )
