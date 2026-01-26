import logging
from typing import Dict, Optional

from sqlalchemy.orm import Session

from app.models.auto_reply_template import AutoReplyTemplate

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
