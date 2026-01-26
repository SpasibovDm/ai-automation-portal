from datetime import datetime

from pydantic import BaseModel


class AutoReplyTemplateBase(BaseModel):
    trigger_type: str
    subject_template: str
    body_template: str


class AutoReplyTemplateCreate(AutoReplyTemplateBase):
    pass


class AutoReplyTemplateRead(AutoReplyTemplateBase):
    id: int
    company_id: int | None
    created_at: datetime

    class Config:
        orm_mode = True
