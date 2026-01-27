from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator


class LeadBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: Optional[str] = None
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
    status: Optional[str] = None
    message: Optional[str] = None
    phone: Optional[str] = None
    tags: Optional[list[str]] = None


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
