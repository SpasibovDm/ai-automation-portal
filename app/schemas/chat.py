import re
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator


def _sanitize_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", value)
    cleaned = cleaned.strip()
    return cleaned


class ChatMessageRequest(BaseModel):
    message: str

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        cleaned = _sanitize_text(value)
        if not cleaned:
            raise ValueError("Message cannot be empty")
        return cleaned


class ChatMessageResponse(BaseModel):
    reply: str


class ChatLeadCreate(BaseModel):
    name: str
    email: EmailStr
    message: str
    company: Optional[str] = None

    @field_validator("name", "message", "company", mode="before")
    @classmethod
    def sanitize_fields(cls, value: Optional[str]) -> Optional[str]:
        return _sanitize_text(value)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        if not value:
            raise ValueError("Name is required")
        return value

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        if not value:
            raise ValueError("Message is required")
        return value
