from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.schemas import TimestampSchema


class CompanyInfoBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    address: str | None = None
    phone: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    about: str | None = None


class CompanyInfoUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    address: str | None = None
    phone: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    about: str | None = None


class CompanyInfoResponse(CompanyInfoBase, TimestampSchema):
    id: UUID
    logo_url: str | None = None
