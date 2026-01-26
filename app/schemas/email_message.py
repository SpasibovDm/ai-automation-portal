from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class EmailMessageBase(BaseModel):
    from_email: EmailStr
    subject: str
    body: str


class EmailMessageCreate(EmailMessageBase):
    company_id: Optional[int] = None


class EmailMessageRead(EmailMessageBase):
    id: int
    received_at: datetime
    processed: bool
    lead_id: Optional[int] = None
    company_id: Optional[int] = None

    class Config:
        orm_mode = True


class AutoReplyPreview(BaseModel):
    subject: str
    body: str


class EmailReceiveResponse(BaseModel):
    email: EmailMessageRead
    auto_reply: Optional[AutoReplyPreview] = None
