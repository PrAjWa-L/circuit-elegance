from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import ContactEnquiry
from app.schemas.enquiry import EnquiryCreate, EnquiryResponse, EnquiryUpdate


def _to_response(enquiry: ContactEnquiry) -> EnquiryResponse:
    return EnquiryResponse.model_validate(enquiry)


def list_enquiries(db: Session) -> list[EnquiryResponse]:
    enquiries = db.query(ContactEnquiry).order_by(ContactEnquiry.created_at.desc()).all()
    return [_to_response(enquiry) for enquiry in enquiries]


def create_enquiry(db: Session, payload: EnquiryCreate) -> EnquiryResponse:
    enquiry = ContactEnquiry(**payload.model_dump())
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return _to_response(enquiry)


def update_enquiry(db: Session, enquiry_id: UUID, payload: EnquiryUpdate) -> EnquiryResponse:
    enquiry = db.get(ContactEnquiry, enquiry_id)
    if not enquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact enquiry not found")
    for field in payload.model_fields_set:
        setattr(enquiry, field, getattr(payload, field))
    db.commit()
    db.refresh(enquiry)
    return _to_response(enquiry)


def delete_enquiry(db: Session, enquiry_id: UUID) -> None:
    enquiry = db.get(ContactEnquiry, enquiry_id)
    if not enquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact enquiry not found")
    db.delete(enquiry)
    db.commit()
