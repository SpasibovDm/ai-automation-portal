import logging

from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog

logger = logging.getLogger(__name__)


def log_activity(
    db: Session,
    *,
    action: str,
    entity_type: str,
    entity_id: int | None,
    company_id: int,
    user_id: int | None = None,
    description: str | None = None,
) -> ActivityLog:
    entry = ActivityLog(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        company_id=company_id,
        user_id=user_id,
        description=description,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    logger.info(
        "Activity logged",
        extra={
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "company_id": company_id,
            "user_id": user_id,
        },
    )
    return entry
