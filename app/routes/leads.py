import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.lead import Lead
from app.models.email_message import EmailMessage
from app.schemas.lead import LeadCreate, LeadEmailRead, LeadRead, LeadStatusUpdate, LeadUpdate
from app.services.activity_service import log_activity
from app.services.lead_service import create_lead, list_leads, update_lead

router = APIRouter(prefix="/leads", tags=["leads"])
logger = logging.getLogger("app.leads")


@router.get("/", response_model=list[LeadRead])
def get_leads(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[LeadRead]:
    return list_leads(db, current_user.company_id)


@router.get("/{lead_id}", response_model=LeadRead)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> LeadRead:
    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id, Lead.company_id == current_user.company_id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead


@router.post("/", response_model=LeadRead, status_code=status.HTTP_201_CREATED)
def create_company_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> LeadRead:
    lead = create_lead(db, lead_in, company_id=current_user.company_id)
    log_activity(
        db,
        action="create",
        entity_type="lead",
        entity_id=lead.id,
        company_id=current_user.company_id,
        user_id=current_user.id,
        description=f"Lead created for {lead.email}",
    )
    return lead


@router.put("/{lead_id}", response_model=LeadRead)
def update_lead_status(
    lead_id: int,
    lead_in: LeadUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> LeadRead:
    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id, Lead.company_id == current_user.company_id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    updated = update_lead(db, lead, lead_in)
    log_activity(
        db,
        action="update",
        entity_type="lead",
        entity_id=updated.id,
        company_id=current_user.company_id,
        user_id=current_user.id,
        description="Lead updated",
    )
    return updated


@router.patch("/{lead_id}/status", response_model=LeadRead)
def update_lead_status_only(
    lead_id: int,
    payload: LeadStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> LeadRead:
    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id, Lead.company_id == current_user.company_id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    previous_status = lead.status
    lead.status = payload.status
    db.add(lead)
    db.commit()
    db.refresh(lead)
    log_activity(
        db,
        action="update",
        entity_type="lead",
        entity_id=lead.id,
        company_id=current_user.company_id,
        user_id=current_user.id,
        description=f"Lead status updated to {payload.status}",
    )
    logger.info(
        "lead.status_changed",
        extra={
            "lead_id": lead.id,
            "company_id": current_user.company_id,
            "user_id": current_user.id,
            "previous_status": previous_status,
            "new_status": payload.status,
        },
    )
    return lead


@router.get("/{lead_id}/emails", response_model=list[LeadEmailRead])
def get_lead_emails(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[LeadEmailRead]:
    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id, Lead.company_id == current_user.company_id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    emails = (
        db.query(EmailMessage)
        .filter(
            EmailMessage.lead_id == lead_id,
            EmailMessage.company_id == current_user.company_id,
        )
        .order_by(EmailMessage.received_at.desc())
        .all()
    )
    results = []
    for email in emails:
        preview = " ".join(email.body.split())[:120]
        results.append(
            LeadEmailRead(
                id=email.id,
                subject=email.subject,
                received_at=email.received_at,
                preview=preview,
            )
        )
    return results
