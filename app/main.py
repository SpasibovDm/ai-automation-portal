import logging
from typing import Callable

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings
from app.core.limiter import limiter
from app.core.database import Base, engine
from app.models import (
    activity_log,
    auto_reply_template,
    company,
    email_message,
    email_reply,
    lead,
    user,
)
from app.routes import auth, auto_replies, chat, companies, dashboard, emails, leads, public, users

Base.metadata.create_all(bind=engine)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

app = FastAPI(title=settings.app_name)
app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    lambda r, e: JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"}),
)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def error_handling_middleware(request: Request, call_next: Callable):
    try:
        return await call_next(request)
    except Exception as exc:  # noqa: BLE001
        logging.getLogger("app.error").exception("Unhandled error", exc_info=exc)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(emails.router)
app.include_router(auto_replies.router)
app.include_router(users.router)
app.include_router(public.router)
app.include_router(dashboard.router)
app.include_router(companies.router)
app.include_router(chat.router)


@app.get("/")
def root() -> dict:
    return {"status": "ok", "app": settings.app_name}
