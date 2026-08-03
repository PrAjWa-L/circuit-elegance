from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.schemas import TimestampSchema

EnquiryStatus = Literal["new", "in_progress", "closed"]


class EnquiryBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    company: str | None = Field(default=None, max_length=255)
    email: EmailStr
    requirements: str = Field(min_length=1)


class EnquiryCreate(EnquiryBase):
    pass


class EnquiryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    company: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = None
    requirements: str | None = Field(default=None, min_length=1)
    status: EnquiryStatus | None = None


class EnquiryResponse(EnquiryBase, TimestampSchema):
    id: UUID
    status: EnquiryStatus
