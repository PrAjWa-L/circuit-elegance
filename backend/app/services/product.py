from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session, joinedload

from app.core.utils import slugify
from app.models import Category, Product, ProductImage
from app.schemas.product import ProductCreate, ProductImageResponse, ProductResponse, ProductUpdate
from app.services.upload import build_upload_url, delete_upload, save_upload


def _primary_image(product: Product) -> str | None:
    if not product.images:
        return None
    primary = next((img for img in product.images if img.is_primary), product.images[0])
    return build_upload_url(primary.file_path)


def _image_responses(product: Product) -> list[ProductImageResponse]:
    return [
        ProductImageResponse(
            id=img.id,
            url=build_upload_url(img.file_path),
            alt_text=img.alt_text,
            is_primary=img.is_primary,
            sort_order=img.sort_order,
            created_at=img.created_at,
            updated_at=img.updated_at,
        )
        for img in product.images
    ]


def to_product_response(product: Product) -> ProductResponse:
    return ProductResponse(
        id=product.id,
        slug=product.slug,
        sku=product.sku,
        name=product.name,
        category_id=product.category_id,
        category_name=product.category.name if product.category else "",
        rating=product.rating,
        description=product.description,
        price=product.price,
        specifications=product.specifications,
        is_featured=product.is_featured,
        is_active=product.is_active,
        sort_order=product.sort_order,
        images=_image_responses(product),
        image=_primary_image(product),
        created_at=product.created_at,
        updated_at=product.updated_at,
    )


def _base_query(db: Session, include_inactive: bool = False):
    query = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images),
    )
    if not include_inactive:
        query = query.filter(Product.is_active.is_(True))
    return query


def list_products(
    db: Session,
    *,
    category_slug: str | None = None,
    featured: bool | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 50,
    include_inactive: bool = False,
) -> tuple[list[ProductResponse], int]:
    query = _base_query(db, include_inactive)

    if category_slug:
        query = query.join(Category).filter(Category.slug == category_slug)
    if featured is not None:
        query = query.filter(Product.is_featured.is_(featured))
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(pattern))
            | (Product.sku.ilike(pattern))
            | (Product.description.ilike(pattern))
        )

    total = query.count()
    products = (
        query.order_by(Product.sort_order, Product.name)
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return [to_product_response(p) for p in products], total


def get_product(db: Session, product_id: UUID, include_inactive: bool = False) -> Product:
    product = _base_query(db, include_inactive).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


def get_product_by_slug(db: Session, slug: str) -> Product:
    product = _base_query(db).filter(Product.slug == slug).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


def _validate_category(db: Session, category_id: UUID) -> Category:
    category = db.query(Category).filter(Category.id == category_id, Category.is_active.is_(True)).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category")
    return category


def create_product(db: Session, payload: ProductCreate) -> ProductResponse:
    _validate_category(db, payload.category_id)
    slug = payload.slug or slugify(payload.name)

    if db.query(Product).filter((Product.slug == slug) | (Product.sku == payload.sku)).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Product slug or SKU already exists")

    product = Product(
        slug=slug,
        sku=payload.sku,
        name=payload.name,
        category_id=payload.category_id,
        rating=payload.rating,
        description=payload.description,
        price=payload.price,
        specifications=payload.specifications or {},
        is_featured=payload.is_featured,
        is_active=payload.is_active,
        sort_order=payload.sort_order,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    product = get_product(db, product.id, include_inactive=True)
    return to_product_response(product)


def update_product(db: Session, product_id: UUID, payload: ProductUpdate) -> ProductResponse:
    product = get_product(db, product_id, include_inactive=True)

    if payload.category_id is not None:
        _validate_category(db, payload.category_id)
        product.category_id = payload.category_id

    if payload.sku is not None and payload.sku != product.sku:
        if db.query(Product).filter(Product.sku == payload.sku, Product.id != product_id).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")
        product.sku = payload.sku

    if "slug" in payload.model_fields_set and payload.slug:
        if db.query(Product).filter(Product.slug == payload.slug, Product.id != product_id).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")
        product.slug = payload.slug
    elif payload.name is not None:
        product.slug = slugify(payload.name)

    if payload.name is not None:
        product.name = payload.name
    if "rating" in payload.model_fields_set:
        product.rating = payload.rating
    if "description" in payload.model_fields_set:
        product.description = payload.description
    if payload.price is not None:
        product.price = payload.price
    if "specifications" in payload.model_fields_set:
        product.specifications = payload.specifications
    if payload.is_featured is not None:
        product.is_featured = payload.is_featured
    if payload.is_active is not None:
        product.is_active = payload.is_active
    if payload.sort_order is not None:
        product.sort_order = payload.sort_order

    db.commit()
    product = get_product(db, product_id, include_inactive=True)
    return to_product_response(product)


def soft_delete_product(db: Session, product_id: UUID) -> None:
    product = get_product(db, product_id, include_inactive=True)
    product.is_active = False
    db.commit()


async def upload_product_images(
    db: Session,
    product_id: UUID,
    files: list[UploadFile],
    *,
    set_primary: bool = False,
) -> ProductResponse:
    product = get_product(db, product_id, include_inactive=True)
    existing_count = len(product.images)
    saved_paths: list[str] = []

    try:
        for file in files:
            file_path, _ = await save_upload(file, "products")
            saved_paths.append(file_path)

        if set_primary:
            for image in product.images:
                image.is_primary = False

        for index, file_path in enumerate(saved_paths):
            db.add(
                ProductImage(
                    product_id=product.id,
                    file_path=file_path,
                    alt_text=product.name,
                    is_primary=set_primary and index == 0,
                    sort_order=existing_count + index,
                )
            )

        if not product.images and saved_paths:
            db.flush()
            first_image = (
                db.query(ProductImage)
                .filter(ProductImage.product_id == product.id)
                .order_by(ProductImage.sort_order)
                .first()
            )
            if first_image:
                first_image.is_primary = True

        db.commit()
    except Exception:
        db.rollback()
        for file_path in saved_paths:
            delete_upload(file_path)
        raise
    product = get_product(db, product_id, include_inactive=True)
    return to_product_response(product)


def delete_product_image(db: Session, product_id: UUID, image_id: UUID) -> ProductResponse:
    product = get_product(db, product_id, include_inactive=True)
    image = (
        db.query(ProductImage)
        .filter(ProductImage.id == image_id, ProductImage.product_id == product_id)
        .first()
    )
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    was_primary = image.is_primary
    file_path = image.file_path
    db.delete(image)
    db.flush()

    if was_primary:
        next_image = (
            db.query(ProductImage)
            .filter(ProductImage.product_id == product_id)
            .order_by(ProductImage.sort_order)
            .first()
        )
        if next_image:
            next_image.is_primary = True

    db.commit()
    delete_upload(file_path)
    product = get_product(db, product_id, include_inactive=True)
    return to_product_response(product)
