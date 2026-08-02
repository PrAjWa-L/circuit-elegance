from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas import TimestampSchema


class ProductImageResponse(TimestampSchema):
    id: UUID
    url: str
    alt_text: str | None = None
    is_primary: bool
    sort_order: int


class ProductBase(BaseModel):
    sku: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=255)
    category_id: UUID
    rating: str | None = Field(default=None, max_length=255)
    description: str | None = None
    price: Decimal = Field(ge=0)
    specifications: dict | None = None
    is_featured: bool = False
    is_active: bool = True
    sort_order: int = 0


class ProductCreate(ProductBase):
    slug: str | None = Field(default=None, min_length=1, max_length=150)


class ProductUpdate(BaseModel):
    sku: str | None = Field(default=None, min_length=1, max_length=100)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: str | None = Field(default=None, min_length=1, max_length=150)
    category_id: UUID | None = None
    rating: str | None = Field(default=None, max_length=255)
    description: str | None = None
    price: Decimal | None = Field(default=None, ge=0)
    specifications: dict | None = None
    is_featured: bool | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class ProductResponse(TimestampSchema):
    id: UUID
    slug: str
    sku: str
    name: str
    category_id: UUID
    category_name: str
    rating: str | None
    description: str | None
    price: Decimal
    specifications: dict | None
    is_featured: bool
    is_active: bool
    sort_order: int
    images: list[ProductImageResponse] = []
    image: str | None = None


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    limit: int
