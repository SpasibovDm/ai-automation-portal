from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.schemas.enums import LeadStatus


class LeadBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: Optional[str] = None
    preferred_language: Optional[str] = None
    source: Optional[str] = None
    conversation_summary: Optional[str] = None
    tags: Optional[list[str]] = None

    @field_validator("tags", mode="before")
    @classmethod
    def split_tags(cls, value: Optional[str | list[str]]) -> Optional[list[str]]:
        if isinstance(value, str):
            return [tag.strip() for tag in value.split(",") if tag.strip()]
        return value


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    status: Optional[LeadStatus] = None
    message: Optional[str] = None
    phone: Optional[str] = None
    tags: Optional[list[str]] = None


class LeadStatusUpdate(BaseModel):
    status: LeadStatus


class LeadRead(LeadBase):
    id: int
    status: LeadStatus
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


class LeadEmailRead(BaseModel):
    id: int
    subject: str
    received_at: datetime
    preview: str

    class Config:
        orm_mode = True
