from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.lead import Lead
from app.schemas.lead import LeadRead, LeadUpdate
from app.services.lead_service import list_leads, update_lead

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("/", response_model=list[LeadRead])
def get_leads(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[LeadRead]:
    return list_leads(db, current_user.company_id)


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
    return update_lead(db, lead, lead_in)
