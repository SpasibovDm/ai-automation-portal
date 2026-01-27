import logging
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.email_message import EmailMessage
from app.models.email_reply import EmailReply
from app.models.email_integration import EmailIntegration
from app.models.lead import Lead
from app.schemas.email_message import EmailMessageCreate
from app.services.email_provider import get_email_client

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


def create_email_reply(
    db: Session,
    *,
    email: EmailMessage,
    subject: str,
    body: str,
    generated_by_ai: bool = True,
) -> EmailReply:
    reply = EmailReply(
        email_id=email.id,
        subject=subject,
        body=body,
        generated_by_ai=generated_by_ai,
    )
    email.processed = True
    db.add(reply)
    db.add(email)
    db.commit()
    db.refresh(reply)
    return reply


def send_email_reply(
    db: Session,
    *,
    reply: EmailReply,
    integration: EmailIntegration,
) -> EmailReply:
    reply.send_attempted_at = datetime.utcnow()
    reply.provider = integration.provider
    client = get_email_client(integration)
    message_id = client.send_email(
        to_email=reply.email.from_email,
        subject=reply.subject,
        body=reply.body,
    )
    reply.send_status = "sent"
    reply.sent_at = datetime.utcnow()
    reply.provider_message_id = message_id
    reply.send_error = None
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return reply
