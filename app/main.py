import logging

from fastapi import FastAPI

from app.core.config import settings
from app.core.database import Base, engine
from app.models import auto_reply_template, company, email_message, lead, user
from app.routes import auth, auto_replies, emails, leads, users

Base.metadata.create_all(bind=engine)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

app = FastAPI(title=settings.app_name)

app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(emails.router)
app.include_router(auto_replies.router)
app.include_router(users.router)


@app.get("/")
def root() -> dict:
    return {"status": "ok", "app": settings.app_name}
