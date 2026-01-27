from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_admin
from app.schemas.email_integration import EmailIntegrationConnect, EmailIntegrationStatus
from app.services.email_integration_service import list_email_integrations, upsert_email_integration

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.post("/email/connect", response_model=EmailIntegrationStatus, status_code=status.HTTP_201_CREATED)
def connect_email_integration(
    payload: EmailIntegrationConnect,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
) -> EmailIntegrationStatus:
    integration = upsert_email_integration(
        db,
        company_id=current_user.company_id,
        payload=payload,
    )
    return integration


@router.get("/email/status", response_model=list[EmailIntegrationStatus])
def email_integration_status(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[EmailIntegrationStatus]:
    return list_email_integrations(db, current_user.company_id)
