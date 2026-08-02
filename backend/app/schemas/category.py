from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas import TimestampSchema


class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None
    sort_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    slug: str | None = Field(default=None, min_length=1, max_length=100)


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    slug: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class CategoryResponse(CategoryBase, TimestampSchema):
    id: UUID
    slug: str
    product_count: int = 0
