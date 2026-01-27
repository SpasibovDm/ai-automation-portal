from app.core.config import settings
from app.services.llm_service import generate_ai_reply as generate_llm_reply


def generate_ai_reply(message: str) -> str:
    if settings.ai_api_key and settings.ai_api_key != "change-this-key":
        return generate_llm_reply(message)
    return (
        "Thanks for reaching out! I can help with pricing, setup details, or scheduling a demo. "
        "Share a bit more about what you're looking for and I’ll guide you."
    )
