from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.core.database import Base


class AutoReplyTemplate(Base):
    __tablename__ = "auto_reply_templates"

    id = Column(Integer, primary_key=True, index=True)
    trigger_type = Column(String, nullable=False)
    subject_template = Column(String, nullable=False)
    body_template = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
