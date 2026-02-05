import logging
from typing import Dict, Optional

from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.auto_reply_template import AutoReplyTemplate
from app.services.llm_service import generate_ai_reply

logger = logging.getLogger(__name__)


class SafeDict(dict):
    def __missing__(self, key: str) -> str:
        return ""


def get_template(
    db: Session, trigger_type: str, company_id: int | None
) -> Optional[AutoReplyTemplate]:
    if company_id is None:
        logger.warning("No company_id provided for auto-reply template lookup")
        return None
    return (
        db.query(AutoReplyTemplate)
        .filter(
            AutoReplyTemplate.trigger_type == trigger_type,
            AutoReplyTemplate.company_id == company_id,
        )
        .order_by(AutoReplyTemplate.created_at.desc())
        .first()
    )


def generate_reply(
    template: AutoReplyTemplate, context: Dict[str, str]
) -> Dict[str, str]:
    safe_context = SafeDict(**context)
    return {
        "subject": template.subject_template.format_map(safe_context),
        "body": template.body_template.format_map(safe_context),
    }


def generate_ai_reply_from_template(
    template: AutoReplyTemplate,
    company: Company,
    context: Dict[str, str],
) -> Dict[str, str]:
    base = generate_reply(template, context)
    tone_line = f"Tone: {template.tone}\n" if template.tone else ""
    category_line = f"Category: {template.category}\n" if template.category else ""
    prompt = (
        f"{company.ai_prompt_template}\n"
        f"{tone_line}{category_line}"
        f"Subject suggestion: {base['subject']}\n"
        f"Context:\n{context}\n\n"
        "Draft a helpful, concise reply."
    )
    body = generate_ai_reply(prompt, company.ai_model)
    return {"subject": base["subject"], "body": body}
