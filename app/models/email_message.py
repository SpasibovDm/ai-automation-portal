from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class EmailMessage(Base):
    __tablename__ = "email_messages"

    id = Column(Integer, primary_key=True, index=True)
    from_email = Column(String, index=True, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(String, nullable=False)
    received_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    processed = Column(Boolean, default=False, nullable=False)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)

    lead = relationship("Lead", back_populates="emails")
    company = relationship("Company", back_populates="emails")
    replies = relationship("EmailReply", back_populates="email", cascade="all, delete-orphan")
