from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.email_message import EmailMessage
from app.schemas.email_message import EmailMessageCreate, EmailMessageRead, EmailReceiveResponse
from app.services.auto_reply_service import generate_reply, get_template
from app.services.email_service import receive_email

router = APIRouter(prefix="/emails", tags=["emails"])


@router.get("/", response_model=list[EmailMessageRead])
def list_emails(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[EmailMessageRead]:
    return (
        db.query(EmailMessage)
        .filter(EmailMessage.company_id == current_user.company_id)
        .order_by(EmailMessage.received_at.desc())
        .all()
    )


@router.post("/receive", response_model=EmailReceiveResponse)
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
