from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_admin
from app.models.auto_reply_template import AutoReplyTemplate
from app.schemas.auto_reply_template import (
    AutoReplyTemplateCreate,
    AutoReplyTemplateRead,
    AutoReplyTemplateUpdate,
)

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


@router.put("/{template_id}", response_model=AutoReplyTemplateRead)
def update_template(
    template_id: int,
    template_in: AutoReplyTemplateUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
) -> AutoReplyTemplateRead:
    template = (
        db.query(AutoReplyTemplate)
        .filter(
            AutoReplyTemplate.id == template_id,
            AutoReplyTemplate.company_id == current_user.company_id,
        )
        .first()
    )
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    updates = template_in.dict(exclude_unset=True)
    for key, value in updates.items():
        setattr(template, key, value)
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
) -> None:
    template = (
        db.query(AutoReplyTemplate)
        .filter(
            AutoReplyTemplate.id == template_id,
            AutoReplyTemplate.company_id == current_user.company_id,
        )
        .first()
    )
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    db.delete(template)
    db.commit()
    return None
