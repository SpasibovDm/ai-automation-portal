from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from datetime import datetime, timedelta

from app.models.email_message import EmailMessage
from app.models.email_reply import EmailReply
from app.models.lead import Lead
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> DashboardStats:
    total_leads = db.query(Lead).filter(Lead.company_id == current_user.company_id).count()
    today = datetime.utcnow() - timedelta(days=1)
    leads_today = (
        db.query(Lead)
        .filter(Lead.company_id == current_user.company_id, Lead.created_at >= today)
        .count()
    )
    emails_today = (
        db.query(EmailMessage)
        .filter(EmailMessage.company_id == current_user.company_id, EmailMessage.received_at >= today)
        .count()
    )
    replies_sent = (
        db.query(EmailReply)
        .join(EmailMessage, EmailReply.email_id == EmailMessage.id)
        .filter(EmailMessage.company_id == current_user.company_id)
        .count()
    )
    return DashboardStats(
        total_leads=total_leads,
        leads_today=leads_today,
        emails_today=emails_today,
        replies_sent=replies_sent,
    )
