from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_admin
from app.models.auto_reply_template import AutoReplyTemplate
from app.schemas.auto_reply_template import AutoReplyTemplateCreate, AutoReplyTemplateRead

router = APIRouter(prefix="/auto-replies", tags=["auto-replies"])


@router.post("/", response_model=AutoReplyTemplateRead)
def create_template(
    template_in: AutoReplyTemplateCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
) -> AutoReplyTemplateRead:
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user must belong to a company",
        )
    template = AutoReplyTemplate(**template_in.dict(), company_id=current_user.company_id)
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.get("/", response_model=list[AutoReplyTemplateRead])
def list_templates(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
) -> list[AutoReplyTemplateRead]:
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user must belong to a company",
        )
    return (
        db.query(AutoReplyTemplate)
        .filter(AutoReplyTemplate.company_id == current_user.company_id)
        .order_by(AutoReplyTemplate.created_at.desc())
        .all()
    )
