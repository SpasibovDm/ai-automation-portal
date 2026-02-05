from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class AutoReplyTemplate(Base):
    __tablename__ = "auto_reply_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    category = Column(String, nullable=True)
    tone = Column(String, nullable=True)
    trigger_type = Column(String, nullable=False)
    subject_template = Column(String, nullable=False)
    body_template = Column(String, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company", back_populates="auto_reply_templates")
