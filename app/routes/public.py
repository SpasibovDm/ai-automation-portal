from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.deps import get_company_from_api_key, get_db
from app.schemas.email_message import EmailMessageCreate, EmailReceiveResponse
from app.schemas.lead import LeadCreate, LeadCreateResponse
from app.services.activity_service import log_activity
from app.services.auto_reply_service import generate_reply, get_template
from app.services.email_service import receive_email
from app.services.lead_service import create_lead
from app.tasks import generate_email_reply_task

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

    generate_email_reply_task.delay(email.id, company.id)
    return EmailReceiveResponse(email=email, auto_reply=None)
