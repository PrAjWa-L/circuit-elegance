from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.database import get_db
from app.models import AdminUser
from app.schemas.company import CompanyInfoResponse, CompanyInfoUpdate
from app.services import company as company_service

router = APIRouter(prefix="/company", tags=["company"])
admin_router = APIRouter(prefix="/admin/company", tags=["admin-company"])


@router.get("", response_model=CompanyInfoResponse)
def get_company(db: Session = Depends(get_db)) -> CompanyInfoResponse:
    return company_service.get_company_response(db)


@admin_router.put("", response_model=CompanyInfoResponse)
def update_company(
    payload: CompanyInfoUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> CompanyInfoResponse:
    return company_service.update_company_info(db, payload)


@admin_router.post("/logo", response_model=CompanyInfoResponse)
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> CompanyInfoResponse:
    return await company_service.upload_company_logo(db, file)
