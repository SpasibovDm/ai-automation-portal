from typing import Dict, Optional

from sqlalchemy.orm import Session

from app.models.auto_reply_template import AutoReplyTemplate


class SafeDict(dict):
    def __missing__(self, key: str) -> str:
        return ""


def get_template(db: Session, trigger_type: str) -> Optional[AutoReplyTemplate]:
    return (
        db.query(AutoReplyTemplate)
        .filter(AutoReplyTemplate.trigger_type == trigger_type)
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
