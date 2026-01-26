from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadCreateResponse, LeadRead, LeadUpdate
from app.services.auto_reply_service import generate_reply, get_template
from app.services.lead_service import create_lead, list_leads, update_lead

router = APIRouter(prefix="/leads", tags=["leads"])


@router.post("/public", response_model=LeadCreateResponse, status_code=status.HTTP_201_CREATED)
def create_public_lead(
    lead_in: LeadCreate,
    company_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
) -> LeadCreateResponse:
    if company_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="company_id is required for public lead submissions",
        )
    lead = create_lead(db, lead_in, company_id=company_id)
    template = get_template(db, "lead", lead.company_id)
    auto_reply = None
    if template:
        auto_reply = generate_reply(template, {"name": lead.name, "email": lead.email})
    return LeadCreateResponse(lead=lead, auto_reply=auto_reply)


@router.get("/", response_model=list[LeadRead])
def get_leads(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[LeadRead]:
    return list_leads(db, current_user.company_id)


@router.patch("/{lead_id}", response_model=LeadRead)
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
