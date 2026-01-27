from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.deps import get_company_from_api_key, get_db
from app.models.company import Company
from app.models.email_message import EmailMessage
from app.schemas.email_message import EmailMessageCreate, EmailReceiveResponse
from app.schemas.lead import LeadCreate, LeadCreateResponse
from app.services.activity_service import log_activity
from app.services.auto_reply_service import generate_ai_reply_from_template, generate_reply, get_template
from app.services.email_service import create_email_reply, receive_email
from app.services.lead_service import create_lead

router = APIRouter(tags=["public"])


@router.post("/public/lead", response_model=LeadCreateResponse, status_code=status.HTTP_201_CREATED)
def create_public_lead(
    lead_in: LeadCreate,
    company=Depends(get_company_from_api_key),
    db: Session = Depends(get_db),
) -> LeadCreateResponse:
    lead = create_lead(db, lead_in, company_id=company.id)
    log_activity(
        db,
        action="create",
        entity_type="lead",
        entity_id=lead.id,
        company_id=company.id,
        description="Lead captured via public endpoint",
    )
    template = get_template(db, "lead", lead.company_id)
    auto_reply = None
    if template:
        auto_reply = generate_reply(template, {"name": lead.name, "email": lead.email})
    return LeadCreateResponse(lead=lead, auto_reply=auto_reply)


@router.post("/webhook/email", response_model=EmailReceiveResponse)
def receive_incoming_email(
    email_in: EmailMessageCreate,
    background_tasks: BackgroundTasks,
    company=Depends(get_company_from_api_key),
    db: Session = Depends(get_db),
) -> EmailReceiveResponse:
    email, _ = receive_email(db, EmailMessageCreate(**email_in.dict(), company_id=company.id))
    log_activity(
        db,
        action="create",
        entity_type="email",
        entity_id=email.id,
        company_id=company.id,
        description="Email received via webhook",
    )

    def _generate_reply(email_id: int, company_id: int) -> None:
        session = SessionLocal()
        try:
            email_record = session.query(EmailMessage).filter(EmailMessage.id == email_id).first()
            company_record = session.query(Company).filter(Company.id == company_id).first()
            if not email_record or not company_record or not company_record.auto_reply_enabled:
                return
            template = get_template(session, "email", company_id)
            if not template:
                return
            auto_reply = generate_ai_reply_from_template(
                template,
                company_record,
                {
                    "email": email_record.from_email,
                    "subject": email_record.subject,
                    "body": email_record.body,
                },
            )
            create_email_reply(
                session,
                email=email_record,
                subject=auto_reply["subject"],
                body=auto_reply["body"],
            )
            log_activity(
                session,
                action="create",
                entity_type="email_reply",
                entity_id=email_record.id,
                company_id=company_id,
                description="AI reply generated",
            )
        finally:
            session.close()

    background_tasks.add_task(_generate_reply, email.id, company.id)
    return EmailReceiveResponse(email=email, auto_reply=None)
