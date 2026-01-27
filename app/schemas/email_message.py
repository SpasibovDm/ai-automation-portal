from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class EmailReplyRead(BaseModel):
    id: int
    subject: str
    body: str
    generated_by_ai: bool
    created_at: datetime

    class Config:
        orm_mode = True


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
    replies: list[EmailReplyRead] = Field(default_factory=list)

    class Config:
        orm_mode = True


class AutoReplyPreview(BaseModel):
    subject: str
    body: str


class EmailReceiveResponse(BaseModel):
    email: EmailMessageRead
    auto_reply: Optional[AutoReplyPreview] = None


class EmailThreadRead(BaseModel):
    email: EmailMessageRead
