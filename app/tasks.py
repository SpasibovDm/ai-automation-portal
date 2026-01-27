import logging
from datetime import datetime

from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.company import Company
from app.models.email_message import EmailMessage
from app.models.email_reply import EmailReply
from app.services.activity_service import log_activity
from app.services.auto_reply_service import generate_ai_reply_from_template, get_template
from app.services.email_integration_service import get_active_integration
from app.services.email_service import create_email_reply, send_email_reply

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.generate_email_reply_task")
def generate_email_reply_task(email_id: int, company_id: int) -> None:
    session = SessionLocal()
    try:
        email_record = session.query(EmailMessage).filter(EmailMessage.id == email_id).first()
        company_record = session.query(Company).filter(Company.id == company_id).first()
        if not email_record or not company_record or not company_record.auto_reply_enabled:
            return
        template = get_template(session, "email", company_id)
        if not template:
            return
        auto_reply = generate_ai_reply_from_template(
            template,
            company_record,
            {
                "email": email_record.from_email,
                "subject": email_record.subject,
                "body": email_record.body,
            },
        )
        reply = create_email_reply(
            session,
            email=email_record,
            subject=auto_reply["subject"],
            body=auto_reply["body"],
        )
        log_activity(
            session,
            action="create",
            entity_type="email_reply",
            entity_id=reply.id,
            company_id=company_id,
            description="AI reply generated",
        )
        send_email_reply_task.delay(reply.id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to generate email reply", exc_info=exc)
    finally:
        session.close()


@celery_app.task(name="app.tasks.send_email_reply_task", bind=True, max_retries=3, default_retry_delay=60)
def send_email_reply_task(self, reply_id: int) -> None:
    session = SessionLocal()
    try:
        reply = session.query(EmailReply).filter(EmailReply.id == reply_id).first()
        if not reply:
            return
        email = reply.email
        integration = get_active_integration(session, email.company_id) if email else None
        if not integration:
            reply.send_status = "failed"
            reply.send_error = "No connected email integration"
            session.add(reply)
            session.commit()
            return
        reply.send_attempted_at = reply.send_attempted_at or datetime.utcnow()
        reply.provider = integration.provider
        session.add(reply)
        session.commit()
        send_email_reply(session, reply=reply, integration=integration)
        log_activity(
            session,
            action="update",
            entity_type="email_reply",
            entity_id=reply.id,
            company_id=email.company_id if email else None,
            description="Email reply sent via integration",
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to send email reply", exc_info=exc)
        reply = session.query(EmailReply).filter(EmailReply.id == reply_id).first()
        if reply:
            reply.send_status = "retry"
            reply.send_error = str(exc)
            session.add(reply)
            session.commit()
        raise self.retry(exc=exc)
    finally:
        session.close()
