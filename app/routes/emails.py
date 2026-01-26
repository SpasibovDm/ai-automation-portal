from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.schemas.email_message import EmailMessageCreate, EmailReceiveResponse
from app.services.auto_reply_service import generate_reply, get_template
from app.services.email_service import receive_email

router = APIRouter(prefix="/emails", tags=["emails"])


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
