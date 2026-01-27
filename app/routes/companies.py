import secrets

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_admin
from app.models.company import Company
from app.schemas.company import CompanyRead, CompanyUpdate
from app.services.activity_service import log_activity

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/me", response_model=CompanyRead)
def get_company_profile(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
) -> CompanyRead:
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    return company


@router.put("/me", response_model=CompanyRead)
def update_company_profile(
    payload: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
) -> CompanyRead:
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    updates = payload.dict(exclude_unset=True)
    for key, value in updates.items():
        setattr(company, key, value)
    db.add(company)
    db.commit()
    db.refresh(company)
    log_activity(
        db,
        action="update",
        entity_type="company",
        entity_id=company.id,
        company_id=company.id,
        user_id=current_user.id,
        description="Company settings updated",
    )
    return company


@router.post("/me/rotate-key", response_model=CompanyRead)
def rotate_company_key(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
) -> CompanyRead:
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    company.api_key = secrets.token_urlsafe(24)
    db.add(company)
    db.commit()
    db.refresh(company)
    log_activity(
        db,
        action="update",
        entity_type="company",
        entity_id=company.id,
        company_id=company.id,
        user_id=current_user.id,
        description="API key rotated",
    )
    return company
