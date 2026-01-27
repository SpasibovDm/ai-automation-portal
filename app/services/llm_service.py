import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


def generate_ai_reply(prompt: str, model: str | None = None) -> str:
    payload = {
        "model": model or settings.ai_default_model,
        "messages": [
            {"role": "system", "content": "You are an expert B2B support assistant."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 300,
    }
    headers = {"Authorization": f"Bearer {settings.ai_api_key}"}
    url = f"{settings.ai_base_url.rstrip('/')}/chat/completions"
    try:
        response = httpx.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to generate AI reply", exc_info=exc)
        return "Thanks for reaching out. Our team is reviewing your request and will respond shortly."
