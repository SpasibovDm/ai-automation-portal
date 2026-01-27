import logging

from sqlalchemy.orm import Session

from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadUpdate

logger = logging.getLogger(__name__)

def create_lead(db: Session, lead_in: LeadCreate, company_id: int | None = None) -> Lead:
    data = lead_in.dict(exclude_none=True)
    tags = data.pop("tags", None)
    lead = Lead(
        **data,
        tags=",".join(tags) if tags else None,
        company_id=company_id,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    logger.info("Created lead", extra={"lead_id": lead.id, "company_id": company_id})
    return lead


def list_leads(db: Session, company_id: int) -> list[Lead]:
    return db.query(Lead).filter(Lead.company_id == company_id).order_by(Lead.created_at.desc()).all()


def update_lead(db: Session, lead: Lead, lead_in: LeadUpdate) -> Lead:
    data = lead_in.dict(exclude_unset=True)
    if "tags" in data:
        tags = data.pop("tags")
        data["tags"] = ",".join(tags) if tags else None
    for key, value in data.items():
        setattr(lead, key, value)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead
