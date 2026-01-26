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
    created_at: datetime

    class Config:
        orm_mode = True
