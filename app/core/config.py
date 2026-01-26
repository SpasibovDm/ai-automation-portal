from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Business Automation Portal"
    secret_key: str = "change-this-secret"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    database_url: str = "sqlite:///./app.db"


settings = Settings()
