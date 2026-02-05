from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.email_message import EmailMessage
from app.models.email_reply import EmailReply
from app.models.lead import Lead
from app.schemas.analytics import AnalyticsOverview, EmailCategoryBreakdown, LeadTrendPoint
from app.services.email_analysis_service import classify_category

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> AnalyticsOverview:
    now = datetime.utcnow()
    last_30_days = now - timedelta(days=30)

    emails_query = (
        db.query(EmailMessage)
        .filter(
            EmailMessage.company_id == current_user.company_id,
            EmailMessage.received_at >= last_30_days,
        )
        .all()
    )
    emails_processed = len(emails_query)

    replies_query = (
        db.query(EmailReply)
        .join(EmailMessage, EmailReply.email_id == EmailMessage.id)
        .filter(
            EmailMessage.company_id == current_user.company_id,
            EmailReply.created_at >= last_30_days,
        )
    )

    total_replies = replies_query.count()
    emails_auto_replied = replies_query.filter(EmailReply.generated_by_ai.is_(True)).count()
    manual_replies = replies_query.filter(EmailReply.generated_by_ai.is_(False)).count()

    leads_generated = (
        db.query(Lead)
        .filter(Lead.company_id == current_user.company_id, Lead.created_at >= last_30_days)
        .count()
    )

    edited_rate = (manual_replies / total_replies) if total_replies else 0.0
    ai_accuracy = 1.0 - edited_rate if total_replies else 0.0
    time_saved_hours = round(emails_auto_replied * 0.25, 1)

    today = now.date()
    start_date = today - timedelta(days=6)
    start_datetime = datetime.combine(start_date, datetime.min.time())
    lead_counts = (
        db.query(func.date(Lead.created_at), func.count(Lead.id))
        .filter(
            Lead.company_id == current_user.company_id,
            Lead.created_at >= start_datetime,
        )
        .group_by(func.date(Lead.created_at))
        .all()
    )
    lead_count_map = {}
    for record_date, count in lead_counts:
        if isinstance(record_date, str):
            record_date = datetime.strptime(record_date, "%Y-%m-%d").date()
        lead_count_map[record_date] = count
    lead_trend = [
        LeadTrendPoint(date=day, count=int(lead_count_map.get(day, 0)))
        for day in (start_date + timedelta(days=i) for i in range(7))
    ]

    category_counts: dict[str, int] = {}
    for email in emails_query:
        category, _ = classify_category(email.subject, email.body)
        category_counts[category] = category_counts.get(category, 0) + 1
    if not category_counts:
        category_counts = {"Other": 0}
    email_category_breakdown = [
        EmailCategoryBreakdown(category=category, count=count)
        for category, count in sorted(category_counts.items(), key=lambda item: item[1], reverse=True)
    ]

    return AnalyticsOverview(
        emails_processed=emails_processed,
        emails_auto_replied=emails_auto_replied,
        leads_generated=leads_generated,
        ai_accuracy=ai_accuracy,
        time_saved_hours=time_saved_hours,
        edited_rate=edited_rate,
        lead_trend=lead_trend,
        email_category_breakdown=email_category_breakdown,
    )
