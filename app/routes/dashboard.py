from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.email_message import EmailMessage
from app.models.lead import Lead
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> DashboardStats:
    total_leads = db.query(Lead).filter(Lead.company_id == current_user.company_id).count()
    new_leads = (
        db.query(Lead)
        .filter(Lead.company_id == current_user.company_id, Lead.status == "new")
        .count()
    )
    emails_received = (
        db.query(EmailMessage)
        .filter(EmailMessage.company_id == current_user.company_id)
        .count()
    )
    return DashboardStats(
        total_leads=total_leads,
        new_leads=new_leads,
        emails_received=emails_received,
    )
