from uuid import UUID

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.database import get_db
from app.models import AdminUser
from app.schemas.product import ProductCreate, ProductListResponse, ProductResponse, ProductUpdate
from app.services import product as product_service

router = APIRouter(prefix="/products", tags=["products"])
admin_router = APIRouter(prefix="/admin/products", tags=["admin-products"])


@router.get("", response_model=ProductListResponse)
def list_products(
    category: str | None = Query(default=None, description="Filter by category slug"),
    featured: bool | None = Query(default=None),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> ProductListResponse:
    items, total = product_service.list_products(
        db,
        category_slug=category,
        featured=featured,
        search=search,
        page=page,
        limit=limit,
    )
    return ProductListResponse(items=items, total=total, page=page, limit=limit)


@router.get("/{slug}", response_model=ProductResponse)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)) -> ProductResponse:
    product = product_service.get_product_by_slug(db, slug)
    return product_service.to_product_response(product)


@admin_router.get("", response_model=ProductListResponse)
def admin_list_products(
    category: str | None = Query(default=None),
    featured: bool | None = Query(default=None),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> ProductListResponse:
    items, total = product_service.list_products(
        db,
        category_slug=category,
        featured=featured,
        search=search,
        page=page,
        limit=limit,
        include_inactive=True,
    )
    return ProductListResponse(items=items, total=total, page=page, limit=limit)


@admin_router.post("", response_model=ProductResponse, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> ProductResponse:
    return product_service.create_product(db, payload)


@admin_router.get("/{product_id}", response_model=ProductResponse)
def admin_get_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> ProductResponse:
    product = product_service.get_product(db, product_id, include_inactive=True)
    return product_service.to_product_response(product)


@admin_router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: UUID,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> ProductResponse:
    return product_service.update_product(db, product_id, payload)


@admin_router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> None:
    product_service.soft_delete_product(db, product_id)


@admin_router.post("/{product_id}/images", response_model=ProductResponse)
async def upload_product_images(
    product_id: UUID,
    files: list[UploadFile] = File(...),
    set_primary: bool = Query(default=False),
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> ProductResponse:
    return await product_service.upload_product_images(
        db, product_id, files, set_primary=set_primary
    )


@admin_router.delete("/{product_id}/images/{image_id}", response_model=ProductResponse)
def delete_product_image(
    product_id: UUID,
    image_id: UUID,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> ProductResponse:
    return product_service.delete_product_image(db, product_id, image_id)
