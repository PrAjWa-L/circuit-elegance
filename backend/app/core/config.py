from functools import lru_cache
import json
from pathlib import Path
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "VOLTCORE API"
    app_env: str = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    host: str = "0.0.0.0"
    port: int = 8000

    database_url: str

    secret_key: str
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    algorithm: str = "HS256"

    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173"]
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 10
    allowed_image_types: Annotated[list[str], NoDecode] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    ]

    admin_email: str = "admin@voltcore.io"
    admin_password: str = "changeme"
    admin_full_name: str = "Admin User"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
            except json.JSONDecodeError:
                parsed = value
            if isinstance(parsed, list):
                return [str(origin).strip() for origin in parsed if str(origin).strip()]
            return [origin.strip() for origin in parsed.split(",") if origin.strip()]
        return value

    @field_validator("allowed_image_types", mode="before")
    @classmethod
    def parse_allowed_image_types(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @property
    def upload_path(self) -> Path:
        return Path(self.upload_dir)

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def cors_origin_regex(self) -> str | None:
        if self.app_env.lower() == "development":
            return r"^https?://(localhost|127\.0\.0\.1|\[::1\])(\:\d+)?$"
        return None


@lru_cache
def get_settings() -> Settings:
    return Settings()
