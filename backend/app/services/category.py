from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.utils import slugify
from app.models import Category, Product
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate


def _to_response(category: Category, product_count: int = 0) -> CategoryResponse:
    return CategoryResponse(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        sort_order=category.sort_order,
        is_active=category.is_active,
        product_count=product_count,
        created_at=category.created_at,
        updated_at=category.updated_at,
    )


def list_categories(db: Session, include_inactive: bool = False) -> list[CategoryResponse]:
    query = db.query(
        Category,
        func.count(Product.id).label("product_count"),
    ).outerjoin(
        Product,
        (Product.category_id == Category.id) & Product.is_active.is_(True),
    )

    if not include_inactive:
        query = query.filter(Category.is_active.is_(True))

    rows = (
        query.group_by(Category.id)
        .order_by(Category.sort_order, Category.name)
        .all()
    )
    return [_to_response(category, product_count) for category, product_count in rows]


def get_category(db: Session, category_id: UUID, include_inactive: bool = False) -> Category:
    query = db.query(Category).filter(Category.id == category_id)
    if not include_inactive:
        query = query.filter(Category.is_active.is_(True))
    category = query.first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


def get_category_response(
    db: Session, category_id: UUID, include_inactive: bool = False
) -> CategoryResponse:
    category = get_category(db, category_id, include_inactive=include_inactive)
    product_count = (
        db.query(Product)
        .filter(Product.category_id == category.id, Product.is_active.is_(True))
        .count()
    )
    return _to_response(category, product_count)


def get_category_by_slug(db: Session, slug: str) -> Category:
    category = db.query(Category).filter(Category.slug == slug, Category.is_active.is_(True)).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


def create_category(db: Session, payload: CategoryCreate) -> CategoryResponse:
    slug = payload.slug or slugify(payload.name)
    if db.query(Category).filter((Category.slug == slug) | (Category.name == payload.name)).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category already exists")

    category = Category(
        name=payload.name,
        slug=slug,
        description=payload.description,
        sort_order=payload.sort_order,
        is_active=payload.is_active,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return _to_response(category)


def update_category(db: Session, category_id: UUID, payload: CategoryUpdate) -> CategoryResponse:
    category = get_category(db, category_id, include_inactive=True)

    if payload.name and payload.name != category.name:
        if db.query(Category).filter(Category.name == payload.name, Category.id != category_id).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name already exists")
        category.name = payload.name

    if payload.slug:
        if db.query(Category).filter(Category.slug == payload.slug, Category.id != category_id).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category slug already exists")
        category.slug = payload.slug
    elif payload.name:
        category.slug = slugify(payload.name)

    if "description" in payload.model_fields_set:
        category.description = payload.description
    if payload.sort_order is not None:
        category.sort_order = payload.sort_order
    if payload.is_active is not None:
        category.is_active = payload.is_active

    db.commit()
    db.refresh(category)
    product_count = db.query(Product).filter(Product.category_id == category.id).count()
    return _to_response(category, product_count)


def delete_category(db: Session, category_id: UUID) -> None:
    category = get_category(db, category_id, include_inactive=True)
    product_count = db.query(Product).filter(Product.category_id == category.id, Product.is_active.is_(True)).count()
    if product_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category with active products",
        )
    category.is_active = False
    db.commit()
