import logging

from sqlalchemy.orm import Session

from app.models.email_message import EmailMessage
from app.models.lead import Lead
from app.schemas.email_message import EmailMessageCreate

logger = logging.getLogger(__name__)


def receive_email(db: Session, email_in: EmailMessageCreate) -> tuple[EmailMessage, int | None]:
    matched_lead = db.query(Lead).filter(Lead.email == email_in.from_email).first()
    email = EmailMessage(**email_in.dict(), lead_id=matched_lead.id if matched_lead else None)
    if matched_lead:
        matched_lead.status = "contacted"
        db.add(matched_lead)
    else:
        logger.info("No lead matched incoming email", extra={"from_email": email_in.from_email})
    db.add(email)
    db.commit()
    db.refresh(email)
    return email, matched_lead.company_id if matched_lead else None
