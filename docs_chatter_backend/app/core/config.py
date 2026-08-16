from functools import lru_cache
from typing import Literal

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    ENVIRONMENT: Literal["development", "production"] = "development"
    PROJECT_NAME: str = "Docs Chatter Backend"
    API_PREFIX: str = "/api"
    BACKEND_CORS_ORIGINS: list[str] = []
    SECRET_KEY: SecretStr
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str
    OPENAI_API_KEY: SecretStr | None = None
    PINECONE_API_KEY: SecretStr | None = None
    PINECONE_INDEX_NAME: str = "docs-chatter"

    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: SecretStr
    SUPABASE_BUCKET: str = "documents"

    DEEPGRAM_API_KEY: SecretStr | None = None
    DEEPGRAM_MODEL: str = "nova-3"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
