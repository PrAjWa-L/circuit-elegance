from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str | None = None


class AdminUserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    is_active: bool

    model_config = {"from_attributes": True}