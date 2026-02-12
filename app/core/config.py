import json

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_ALLOWED_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Business Automation Portal"
    secret_key: str = "change-this-secret"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 60 * 24 * 7
    database_url: str = "sqlite:///./app.db"
    rate_limit: str = "100/minute"
    redis_url: str = "redis://localhost:6379/0"
    celery_task_always_eager: bool = False
    ai_base_url: str = "https://api.openai.com/v1"
    ai_api_key: str = "change-this-key"
    ai_default_model: str = "gpt-4o-mini"
    sentry_dsn: str = ""
    sentry_environment: str = "development"
    allowed_origins: list[str] = list(DEFAULT_ALLOWED_ORIGINS)

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def split_origins(cls, value: str | list[str] | tuple[str, ...] | None) -> list[str]:
        if value is None:
            return []
        if isinstance(value, str):
            parsed: list[str]
            raw = value.strip().replace(";", ",")
            if not raw:
                return []
            if raw.startswith("["):
                try:
                    decoded = json.loads(raw)
                except json.JSONDecodeError:
                    parsed = raw.split(",")
                else:
                    if not isinstance(decoded, list):
                        raise ValueError("ALLOWED_ORIGINS must be a list or comma-separated string")
                    parsed = [str(item) for item in decoded]
            else:
                parsed = raw.split(",")
            return cls._normalize_origins(parsed)
        return cls._normalize_origins(value)

    @staticmethod
    def _normalize_origins(origins: list[str]) -> list[str]:
        normalized: list[str] = []
        for origin in origins:
            value = str(origin).strip()
            if not value:
                continue
            if value != "*":
                value = value.rstrip("/")
            if value not in normalized:
                normalized.append(value)
        return normalized

    @model_validator(mode="after")
    def ensure_default_origins(self) -> "Settings":
        if self.allowed_origins:
            return self
        self.allowed_origins = list(DEFAULT_ALLOWED_ORIGINS)
        return self


settings = Settings()
