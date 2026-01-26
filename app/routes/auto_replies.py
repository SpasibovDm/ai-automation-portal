from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_admin
from app.models.auto_reply_template import AutoReplyTemplate
from app.schemas.auto_reply_template import AutoReplyTemplateCreate, AutoReplyTemplateRead

router = APIRouter(prefix="/auto-replies", tags=["auto-replies"])


@router.post("/", response_model=AutoReplyTemplateRead)
def create_template(
    template_in: AutoReplyTemplateCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
) -> AutoReplyTemplateRead:
    template = AutoReplyTemplate(**template_in.dict())
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.get("/", response_model=list[AutoReplyTemplateRead])
def list_templates(
    db: Session = Depends(get_db),
    _=Depends(require_admin),
) -> list[AutoReplyTemplateRead]:
    return db.query(AutoReplyTemplate).order_by(AutoReplyTemplate.created_at.desc()).all()
