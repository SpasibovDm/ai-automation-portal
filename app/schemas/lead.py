from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class LeadBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: Optional[str] = None
    source: Optional[str] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    message: Optional[str] = None
    phone: Optional[str] = None


class LeadRead(LeadBase):
    id: int
    status: str
    created_at: datetime
    company_id: Optional[int] = None

    class Config:
        orm_mode = True


class AutoReplyPreview(BaseModel):
    subject: str
    body: str


class LeadCreateResponse(BaseModel):
    lead: LeadRead
    auto_reply: Optional[AutoReplyPreview] = None
