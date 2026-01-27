from datetime import datetime

from pydantic import BaseModel


class CompanyBase(BaseModel):
    name: str


class CompanyCreate(CompanyBase):
    pass


class CompanyRead(CompanyBase):
    id: int
    api_key: str
    auto_reply_enabled: bool
    ai_model: str
    ai_prompt_template: str
    created_at: datetime

    class Config:
        orm_mode = True


class CompanyUpdate(BaseModel):
    name: str | None = None
    auto_reply_enabled: bool | None = None
    ai_model: str | None = None
    ai_prompt_template: str | None = None
