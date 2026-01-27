from celery import Celery

from app.core.config import settings


celery_app = Celery(
    "automation_tasks",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.task_routes = {
    "app.tasks.generate_email_reply_task": {"queue": "email"},
    "app.tasks.send_email_reply_task": {"queue": "email"},
}
celery_app.conf.task_always_eager = settings.celery_task_always_eager
