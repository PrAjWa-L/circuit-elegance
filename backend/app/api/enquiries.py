from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.database import get_db
from app.models import AdminUser
from app.schemas.enquiry import EnquiryCreate, EnquiryResponse, EnquiryUpdate
from app.services import enquiry as enquiry_service

router = APIRouter(prefix="/enquiries", tags=["enquiries"])
admin_router = APIRouter(prefix="/admin/enquiries", tags=["admin-enquiries"])


@router.post("", response_model=EnquiryResponse, status_code=201)
def create_enquiry(payload: EnquiryCreate, db: Session = Depends(get_db)) -> EnquiryResponse:
    return enquiry_service.create_enquiry(db, payload)


@admin_router.get("", response_model=list[EnquiryResponse])
def list_enquiries(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> list[EnquiryResponse]:
    return enquiry_service.list_enquiries(db)


@admin_router.put("/{enquiry_id}", response_model=EnquiryResponse)
def update_enquiry(
    enquiry_id: UUID,
    payload: EnquiryUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> EnquiryResponse:
    return enquiry_service.update_enquiry(db, enquiry_id, payload)


@admin_router.delete("/{enquiry_id}", status_code=204)
def delete_enquiry(
    enquiry_id: UUID,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> None:
    enquiry_service.delete_enquiry(db, enquiry_id)
