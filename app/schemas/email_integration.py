from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class EmailIntegrationConnect(BaseModel):
    provider: str
    email_address: EmailStr
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "Bearer"
    scopes: Optional[list[str]] = None
    expires_at: Optional[datetime] = None


class EmailIntegrationStatus(BaseModel):
    provider: str
    email_address: EmailStr
    status: str
    expires_at: Optional[datetime] = None
    updated_at: datetime

    class Config:
        orm_mode = True
