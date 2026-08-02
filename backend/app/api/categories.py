from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.database import get_db
from app.models import AdminUser
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services import category as category_service

router = APIRouter(prefix="/categories", tags=["categories"])
admin_router = APIRouter(prefix="/admin/categories", tags=["admin-categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)) -> list[CategoryResponse]:
    return category_service.list_categories(db)


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: UUID, db: Session = Depends(get_db)) -> CategoryResponse:
    return category_service.get_category_response(db, category_id)


@admin_router.get("", response_model=list[CategoryResponse])
def admin_list_categories(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> list[CategoryResponse]:
    return category_service.list_categories(db, include_inactive=True)


@admin_router.post("", response_model=CategoryResponse, status_code=201)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> CategoryResponse:
    return category_service.create_category(db, payload)


@admin_router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: UUID,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> CategoryResponse:
    return category_service.update_category(db, category_id, payload)


@admin_router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> None:
    category_service.delete_category(db, category_id)
