from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.schemas.email_message import EmailMessageCreate, EmailReceiveResponse
from app.schemas.lead import LeadCreate, LeadCreateResponse
from app.services.auto_reply_service import generate_reply, get_template
from app.services.email_service import receive_email
from app.services.lead_service import create_lead

router = APIRouter(tags=["public"])


@router.post("/public/lead", response_model=LeadCreateResponse, status_code=status.HTTP_201_CREATED)
def create_public_lead(
    lead_in: LeadCreate,
    company_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
) -> LeadCreateResponse:
    if company_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="company_id is required for public lead submissions",
        )
    lead = create_lead(db, lead_in, company_id=company_id)
    template = get_template(db, "lead", lead.company_id)
    auto_reply = None
    if template:
        auto_reply = generate_reply(template, {"name": lead.name, "email": lead.email})
    return LeadCreateResponse(lead=lead, auto_reply=auto_reply)


@router.post("/webhook/email", response_model=EmailReceiveResponse)
def receive_incoming_email(
    email_in: EmailMessageCreate, db: Session = Depends(get_db)
) -> EmailReceiveResponse:
    email, company_id = receive_email(db, email_in)
    template = get_template(db, "email", company_id)
    auto_reply = None
    if template:
        auto_reply = generate_reply(
            template,
            {
                "email": email.from_email,
                "subject": email.subject,
            },
        )
    return EmailReceiveResponse(email=email, auto_reply=auto_reply)
