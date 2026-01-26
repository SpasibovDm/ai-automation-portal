from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str
    company_name: str


class UserRead(UserBase):
    id: int
    company_id: int
    role: str
    created_at: datetime

    class Config:
        orm_mode = True


class UserRoleUpdate(BaseModel):
    role: str
