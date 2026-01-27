from typing import Optional

from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.lead import Lead
from app.services.activity_service import log_activity
from app.services.auto_reply_service import generate_reply, get_template


def trigger_auto_reply(db: Session, lead: Lead) -> Optional[dict[str, str]]:
    if not lead.company_id:
        return None
    company = db.query(Company).filter(Company.id == lead.company_id).first()
    if not company or not company.auto_reply_enabled:
        return None
    template = get_template(db, "lead", lead.company_id)
    if not template:
        return None
    reply = generate_reply(
        template,
        {
            "name": lead.name,
            "email": lead.email,
            "message": lead.message or "",
            "source": lead.source,
        },
    )
    log_activity(
        db,
        action="create",
        entity_type="auto_reply",
        entity_id=lead.id,
        company_id=lead.company_id,
        description="Auto-reply prepared for chat lead",
    )
    return reply
