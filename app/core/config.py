from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Business Automation Portal"
    secret_key: str = "change-this-secret"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 60 * 24 * 7
    database_url: str = "postgresql+psycopg2://postgres:postgres@db:5432/automation"
    rate_limit: str = "100/minute"
    redis_url: str = "redis://redis:6379/0"
    celery_task_always_eager: bool = False
    ai_base_url: str = "https://api.openai.com/v1"
    ai_api_key: str = "change-this-key"
    ai_default_model: str = "gpt-4o-mini"
    sentry_dsn: str = ""
    sentry_environment: str = "development"
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def split_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


settings = Settings()
