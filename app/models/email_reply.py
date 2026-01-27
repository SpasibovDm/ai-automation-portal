from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class EmailReply(Base):
    __tablename__ = "email_replies"

    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(Integer, ForeignKey("email_messages.id"), nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    generated_by_ai = Column(Boolean, default=True, nullable=False)
    send_status = Column(String, default="pending", nullable=False)
    send_error = Column(Text, nullable=True)
    provider = Column(String, nullable=True)
    provider_message_id = Column(String, nullable=True)
    send_attempted_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    email = relationship("EmailMessage", back_populates="replies")
