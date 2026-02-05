from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from app.core.deps import get_current_user, get_db
from app.models.company import Company
from app.models.email_message import EmailMessage
from app.schemas.email_message import (
    EmailAnalysis,
    EmailMessageRead,
    EmailReplyGenerated,
    EmailThreadRead,
)
from app.services.activity_service import log_activity
from app.services.auto_reply_service import generate_ai_reply_from_template, get_template
from app.services.email_analysis_service import analyze_email, classify_category, classify_priority
from app.services.email_service import create_email_reply
from app.services.llm_service import generate_ai_reply

router = APIRouter(prefix="/emails", tags=["emails"])


@router.get("/", response_model=list[EmailMessageRead])
def list_emails(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[EmailMessageRead]:
    emails = (
        db.query(EmailMessage)
        .options(joinedload(EmailMessage.replies))
        .filter(EmailMessage.company_id == current_user.company_id)
        .order_by(EmailMessage.received_at.desc())
        .all()
    )
    results: list[EmailMessageRead] = []
    for email in emails:
        category, confidence = classify_category(email.subject, email.body)
        priority = classify_priority(email.subject, email.body)
        preview = " ".join(email.body.split())[:140]
        status = "processed" if email.processed else "new"
        data = EmailMessageRead.model_validate(email, from_attributes=True).model_dump()
        data.update(
            {
                "preview": preview,
                "status": status,
                "category": category,
                "priority": priority,
                "confidence": confidence,
            }
        )
        results.append(EmailMessageRead(**data))
    return results


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
    category, confidence = classify_category(email.subject, email.body)
    priority = classify_priority(email.subject, email.body)
    preview = " ".join(email.body.split())[:140]
    status = "processed" if email.processed else "new"
    data = EmailMessageRead.model_validate(email, from_attributes=True).model_dump()
    data.update(
        {
            "preview": preview,
            "status": status,
            "category": category,
            "priority": priority,
            "confidence": confidence,
        }
    )
    return EmailThreadRead(email=EmailMessageRead(**data))


@router.get("/{email_id}/analysis", response_model=EmailAnalysis)
def get_email_analysis(
    email_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> EmailAnalysis:
    email = (
        db.query(EmailMessage)
        .filter(EmailMessage.id == email_id, EmailMessage.company_id == current_user.company_id)
        .first()
    )
    if not email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    analysis = analyze_email(db, email, company)
    return EmailAnalysis(
        category=analysis.category,
        priority=analysis.priority,
        summary=analysis.summary,
        confidence=analysis.confidence,
        ai_reply_suggestion=analysis.ai_reply_suggestion,
    )


@router.post("/{email_id}/generate-reply", response_model=EmailReplyGenerated)
def generate_email_reply(
    email_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> EmailReplyGenerated:
    email = (
        db.query(EmailMessage)
        .options(joinedload(EmailMessage.replies))
        .filter(EmailMessage.id == email_id, EmailMessage.company_id == current_user.company_id)
        .first()
    )
    if not email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")

    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    context = {
        "email": email.from_email,
        "subject": email.subject,
        "body": email.body,
    }
    subject = f"Re: {email.subject}"
    body = None
    if company:
        template = get_template(db, "email", company.id)
        if template:
            reply = generate_ai_reply_from_template(template, company, context)
            subject = reply["subject"]
            body = reply["body"]

    if body is None:
        prompt = (
            f"Subject: {email.subject}\n"
            f"Message: {email.body}\n\n"
            "Write a concise, professional reply with a clear next step."
        )
        body = generate_ai_reply(prompt, company.ai_model if company else None)

    reply = create_email_reply(db, email=email, subject=subject, body=body, generated_by_ai=True)
    log_activity(
        db,
        action="create",
        entity_type="email_reply",
        entity_id=reply.id,
        company_id=current_user.company_id,
        user_id=current_user.id,
        description="AI reply generated on demand",
    )

    category, confidence = classify_category(email.subject, email.body)
    return EmailReplyGenerated(reply=reply, confidence=confidence)


@router.post("/{email_id}/regenerate-reply", response_model=EmailReplyGenerated)
def regenerate_email_reply(
    email_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> EmailReplyGenerated:
    return generate_email_reply(email_id, db, current_user)
