from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    api_key = Column(String, unique=True, nullable=False, index=True)
    auto_reply_enabled = Column(Boolean, default=True, nullable=False)
    ai_model = Column(String, default="gpt-4o-mini", nullable=False)
    ai_prompt_template = Column(
        Text,
        default="You are a helpful assistant drafting concise B2B responses.",
        nullable=False,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="company")
    leads = relationship("Lead", back_populates="company")
    emails = relationship("EmailMessage", back_populates="company")
    auto_reply_templates = relationship("AutoReplyTemplate", back_populates="company")
    activity_logs = relationship("ActivityLog", back_populates="company")
    email_integrations = relationship(
        "EmailIntegration", back_populates="company", cascade="all, delete-orphan"
    )
