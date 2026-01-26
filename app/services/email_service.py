import logging

from sqlalchemy.orm import Session

from app.models.email_message import EmailMessage
from app.models.lead import Lead
from app.schemas.email_message import EmailMessageCreate

logger = logging.getLogger(__name__)


def receive_email(db: Session, email_in: EmailMessageCreate) -> tuple[EmailMessage, int | None]:
    matched_lead = db.query(Lead).filter(Lead.email == email_in.from_email).first()
    company_id = matched_lead.company_id if matched_lead else email_in.company_id
    email = EmailMessage(
        **email_in.dict(exclude={"company_id"}),
        lead_id=matched_lead.id if matched_lead else None,
        company_id=company_id,
    )
    if matched_lead:
        matched_lead.status = "contacted"
        db.add(matched_lead)
    else:
        logger.info("No lead matched incoming email", extra={"from_email": email_in.from_email})
    db.add(email)
    db.commit()
    db.refresh(email)
    return email, company_id
