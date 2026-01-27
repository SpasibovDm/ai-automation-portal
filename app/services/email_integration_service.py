from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.email_integration import EmailIntegration
from app.schemas.email_integration import EmailIntegrationConnect


def upsert_email_integration(
    db: Session,
    *,
    company_id: int,
    payload: EmailIntegrationConnect,
) -> EmailIntegration:
    integration = (
        db.query(EmailIntegration)
        .filter(
            EmailIntegration.company_id == company_id,
            EmailIntegration.provider == payload.provider,
            EmailIntegration.email_address == payload.email_address,
        )
        .first()
    )
    scopes = ",".join(payload.scopes) if payload.scopes else None
    if integration:
        integration.access_token = payload.access_token
        integration.refresh_token = payload.refresh_token
        integration.token_type = payload.token_type
        integration.scopes = scopes
        integration.expires_at = payload.expires_at
        integration.status = "connected"
        integration.updated_at = datetime.utcnow()
    else:
        integration = EmailIntegration(
            company_id=company_id,
            provider=payload.provider,
            email_address=payload.email_address,
            access_token=payload.access_token,
            refresh_token=payload.refresh_token,
            token_type=payload.token_type,
            scopes=scopes,
            expires_at=payload.expires_at,
            status="connected",
        )
        db.add(integration)
    db.commit()
    db.refresh(integration)
    return integration


def list_email_integrations(db: Session, company_id: int) -> list[EmailIntegration]:
    return (
        db.query(EmailIntegration)
        .filter(EmailIntegration.company_id == company_id)
        .order_by(EmailIntegration.updated_at.desc())
        .all()
    )


def get_active_integration(
    db: Session,
    company_id: int,
    provider: Optional[str] = None,
) -> Optional[EmailIntegration]:
    query = db.query(EmailIntegration).filter(
        EmailIntegration.company_id == company_id,
        EmailIntegration.status == "connected",
    )
    if provider:
        query = query.filter(EmailIntegration.provider == provider)
    return query.order_by(EmailIntegration.updated_at.desc()).first()
