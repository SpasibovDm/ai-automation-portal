from datetime import datetime

from pydantic import BaseModel


class AutoReplyTemplateBase(BaseModel):
    name: str | None = None
    category: str | None = None
    tone: str | None = None
    trigger_type: str
    subject_template: str
    body_template: str


class AutoReplyTemplateCreate(AutoReplyTemplateBase):
    pass


class AutoReplyTemplateUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    tone: str | None = None
    trigger_type: str | None = None
    subject_template: str | None = None
    body_template: str | None = None


class AutoReplyTemplateRead(AutoReplyTemplateBase):
    id: int
    company_id: int | None
    created_at: datetime

    class Config:
        orm_mode = True
