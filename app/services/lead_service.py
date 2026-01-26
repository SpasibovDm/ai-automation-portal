from sqlalchemy.orm import Session

from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadUpdate


def create_lead(db: Session, lead_in: LeadCreate, company_id: int | None = None) -> Lead:
    lead = Lead(**lead_in.dict(), company_id=company_id)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


def list_leads(db: Session, company_id: int) -> list[Lead]:
    return db.query(Lead).filter(Lead.company_id == company_id).order_by(Lead.created_at.desc()).all()


def update_lead(db: Session, lead: Lead, lead_in: LeadUpdate) -> Lead:
    data = lead_in.dict(exclude_unset=True)
    for key, value in data.items():
        setattr(lead, key, value)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead
