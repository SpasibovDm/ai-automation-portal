from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from datetime import datetime, timedelta

from app.models.activity_log import ActivityLog
from app.models.email_message import EmailMessage
from app.models.email_reply import EmailReply
from app.models.lead import Lead
from app.schemas.dashboard import (
    DashboardActivityItem,
    DashboardActivityResponse,
    DashboardStats,
    DashboardUrgentItem,
    DashboardUrgentResponse,
)
from app.services.email_analysis_service import classify_category

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _format_activity(entry: ActivityLog) -> DashboardActivityItem:
    entity = entry.entity_type.replace("_", " ")
    if entry.entity_type == "lead" and entry.action == "create":
        title = "New lead captured"
    elif entry.entity_type == "email" and entry.action == "create":
        title = "New email received"
    elif entry.entity_type == "email_reply" and entry.action == "create":
        title = "AI reply generated"
    elif entry.entity_type in {"auto_reply_template", "template"}:
        title = "Template updated"
    else:
        title = f"{entry.action.title()} {entity}"
    return DashboardActivityItem(
        id=entry.id,
        title=title,
        detail=entry.description,
        created_at=entry.created_at,
        entity_type=entry.entity_type,
        action=entry.action,
    )


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
        .filter(
            EmailMessage.company_id == current_user.company_id,
            EmailReply.send_status == "sent",
        )
        .count()
    )
    return DashboardStats(
        total_leads=total_leads,
        leads_today=leads_today,
        emails_today=emails_today,
        replies_sent=replies_sent,
    )


@router.get("/activity", response_model=DashboardActivityResponse)
def get_activity(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> DashboardActivityResponse:
    logs = (
        db.query(ActivityLog)
        .filter(ActivityLog.company_id == current_user.company_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(20)
        .all()
    )
    ai_logs = [
        log
        for log in logs
        if log.entity_type in {"auto_reply", "email_reply"} or ("ai" in (log.description or "").lower())
    ][:8]
    recent_logs = logs[:8]
    return DashboardActivityResponse(
        ai_activity=[_format_activity(entry) for entry in ai_logs],
        recent_activity=[_format_activity(entry) for entry in recent_logs],
    )


@router.get("/urgent", response_model=DashboardUrgentResponse)
def get_urgent_items(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> DashboardUrgentResponse:
    now = datetime.utcnow()
    pending_replies = (
        db.query(EmailReply)
        .join(EmailMessage, EmailReply.email_id == EmailMessage.id)
        .filter(
            EmailMessage.company_id == current_user.company_id,
            EmailReply.send_status == "pending",
        )
        .count()
    )
    stale_leads = (
        db.query(Lead)
        .filter(
            Lead.company_id == current_user.company_id,
            Lead.status == "new",
            Lead.created_at <= now - timedelta(hours=24),
        )
        .count()
    )

    recent_emails = (
        db.query(EmailMessage)
        .filter(EmailMessage.company_id == current_user.company_id)
        .order_by(EmailMessage.received_at.desc())
        .limit(10)
        .all()
    )
    low_confidence = 0
    for email in recent_emails:
        _, confidence = classify_category(email.subject, email.body)
        if confidence <= 75:
            low_confidence += 1

    items = [
        DashboardUrgentItem(
            title="Emails waiting for approval",
            detail=f"{pending_replies} replies queued",
            level="high" if pending_replies >= 5 else "medium" if pending_replies else "low",
        ),
        DashboardUrgentItem(
            title="Leads without reply > 24h",
            detail=f"{stale_leads} leads need follow-up",
            level="medium" if stale_leads else "low",
        ),
        DashboardUrgentItem(
            title="Low confidence AI replies",
            detail=f"{low_confidence} drafts below confidence threshold",
            level="high" if low_confidence >= 3 else "low" if low_confidence == 0 else "medium",
        ),
    ]
    return DashboardUrgentResponse(items=items)
