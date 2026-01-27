from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from app.core.deps import get_current_user, get_db
from app.models.email_message import EmailMessage
from app.schemas.email_message import EmailMessageRead, EmailThreadRead

router = APIRouter(prefix="/emails", tags=["emails"])


@router.get("/", response_model=list[EmailMessageRead])
def list_emails(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[EmailMessageRead]:
    return (
        db.query(EmailMessage)
        .options(joinedload(EmailMessage.replies))
        .filter(EmailMessage.company_id == current_user.company_id)
        .order_by(EmailMessage.received_at.desc())
        .all()
    )


@router.get("/{email_id}", response_model=EmailThreadRead)
def get_email_thread(
    email_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> EmailThreadRead:
    email = (
        db.query(EmailMessage)
        .options(joinedload(EmailMessage.replies))
        .filter(EmailMessage.id == email_id, EmailMessage.company_id == current_user.company_id)
        .first()
    )
    if not email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")
    return EmailThreadRead(email=email)
