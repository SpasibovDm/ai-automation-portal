from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.limiter import limiter
from app.models.lead import Lead
from app.schemas.chat import ChatLeadCreate, ChatMessageRequest, ChatMessageResponse
from app.services.auto_reply import trigger_auto_reply
from app.services.chat_ai import generate_ai_reply

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/message", response_model=ChatMessageResponse)
@limiter.limit("30/minute")
def chat_message(
    payload: ChatMessageRequest,
    request: Request,
) -> ChatMessageResponse:
    reply = generate_ai_reply(payload.message)
    return ChatMessageResponse(reply=reply)


@router.post("/lead", status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def chat_lead(
    payload: ChatLeadCreate,
    request: Request,
    db: Session = Depends(get_db),
) -> dict[str, int]:
    summary_parts: list[str] = []
    if payload.company:
        summary_parts.append(f"Company: {payload.company}")
    if payload.message:
        summary_parts.append(f"Message: {payload.message}")
    conversation_summary = " | ".join(summary_parts) if summary_parts else None

    lead = Lead(
        name=payload.name,
        email=payload.email,
        message=payload.message,
        source="chat",
        conversation_summary=conversation_summary,
        preferred_language=payload.language,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    trigger_auto_reply(db, lead)
    return {"id": lead.id}
