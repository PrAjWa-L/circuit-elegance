from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models import CompanyInfo
from app.schemas.company import CompanyInfoResponse, CompanyInfoUpdate
from app.services.upload import build_upload_url, delete_upload, save_upload


def _to_response(company: CompanyInfo) -> CompanyInfoResponse:
    return CompanyInfoResponse(
        id=company.id,
        name=company.name,
        logo_url=build_upload_url(company.logo_path) if company.logo_path else None,
        address=company.address,
        phone=company.phone,
        email=company.email,
        about=company.about,
        created_at=company.created_at,
        updated_at=company.updated_at,
    )


def get_company_info(db: Session) -> CompanyInfo:
    company = db.query(CompanyInfo).order_by(CompanyInfo.created_at).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company info not configured")
    return company


def get_company_response(db: Session) -> CompanyInfoResponse:
    return _to_response(get_company_info(db))


def update_company_info(db: Session, payload: CompanyInfoUpdate) -> CompanyInfoResponse:
    company = get_company_info(db)

    for field in ("name", "address", "phone", "email", "about"):
        if field in payload.model_fields_set:
            setattr(company, field, getattr(payload, field))

    db.commit()
    db.refresh(company)
    return _to_response(company)


async def upload_company_logo(db: Session, file: UploadFile) -> CompanyInfoResponse:
    company = get_company_info(db)
    previous_logo_path = company.logo_path
    file_path, _ = await save_upload(file, "company")
    company.logo_path = file_path
    try:
        db.commit()
        db.refresh(company)
    except Exception:
        db.rollback()
        delete_upload(file_path)
        raise
    if previous_logo_path:
        delete_upload(previous_logo_path)
    return _to_response(company)
