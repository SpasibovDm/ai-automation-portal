import logging
import time
import uuid
from typing import Callable

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import sentry_sdk

from app.core.config import settings
from app.core.logging_config import configure_logging
from app.core.limiter import limiter
from app.core.database import Base, engine
from app.models import (
    activity_log,
    auto_reply_template,
    company,
    email_integration,
    email_message,
    email_reply,
    lead,
    user,
)
from app.routes import (
    analytics,
    auth,
    auto_replies,
    chat,
    companies,
    dashboard,
    emails,
    integrations,
    leads,
    public,
    templates,
    users,
)

if settings.database_url.startswith("sqlite"):
    Base.metadata.create_all(bind=engine)

configure_logging()

app = FastAPI(title=settings.app_name)
app.state.limiter = limiter
app.state.started_at = time.time()
app.add_exception_handler(
    RateLimitExceeded,
    lambda r, e: JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"}),
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    errors = []
    for error in exc.errors():
        field_path = ".".join(str(item) for item in error.get("loc", []) if item != "body")
        errors.append(
            {
                "field": field_path or "body",
                "message": error.get("msg", "Invalid value"),
                "type": error.get("type", "validation_error"),
            }
        )
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation failed", "errors": errors},
    )
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.cors_allow_all else settings.allowed_origins,
    allow_credentials=not settings.cors_allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def error_handling_middleware(request: Request, call_next: Callable):
    request_id = str(uuid.uuid4())
    start_time = time.perf_counter()
    try:
        response = await call_next(request)
        duration = time.perf_counter() - start_time
        logging.getLogger("app.request").info(
            "request.completed",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2),
            },
        )
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception as exc:  # noqa: BLE001
        duration = time.perf_counter() - start_time
        logging.getLogger("app.error").exception("Unhandled error", exc_info=exc)
        logging.getLogger("app.request").info(
            "request.failed",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": 500,
                "duration_ms": round(duration * 1000, 2),
            },
        )
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error. Contact support with the request ID.",
                "request_id": request_id,
            },
        )

if settings.sentry_dsn:
    sentry_sdk.init(dsn=settings.sentry_dsn, environment=settings.sentry_environment)

app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(emails.router)
app.include_router(auto_replies.router)
app.include_router(users.router)
app.include_router(public.router)
app.include_router(dashboard.router)
app.include_router(companies.router)
app.include_router(chat.router)
app.include_router(integrations.router)
app.include_router(analytics.router)
app.include_router(templates.router)


@app.get("/")
def root() -> dict:
    return {"status": "ok", "app": settings.app_name}


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/status")
def status() -> dict:
    uptime_seconds = max(0, int(time.time() - app.state.started_at))
    return {
        "status": "operational",
        "app": settings.app_name,
        "environment": settings.environment,
        "uptime_seconds": uptime_seconds,
    }
