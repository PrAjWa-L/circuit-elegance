from typing import Literal

from fastapi import APIRouter, Depends, File, UploadFile

from app.auth.dependencies import get_current_admin
from app.models import AdminUser
from app.schemas.upload import MultiUploadResponse, UploadResponse
from app.services.upload import build_upload_url, save_upload

router = APIRouter(prefix="/admin/uploads", tags=["admin-uploads"])


@router.post("", response_model=MultiUploadResponse)
async def upload_images(
    files: list[UploadFile] = File(...),
    subdirectory: Literal["products", "company", "misc"] = "misc",
    _: AdminUser = Depends(get_current_admin),
) -> MultiUploadResponse:
    uploads: list[UploadResponse] = []
    for file in files:
        file_path, filename = await save_upload(file, subdirectory)
        uploads.append(
            UploadResponse(
                url=build_upload_url(file_path),
                filename=filename,
            )
        )

    return MultiUploadResponse(uploads=uploads)
