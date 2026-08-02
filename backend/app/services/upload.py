from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import Settings, get_settings


def build_upload_url(file_path: str) -> str:
    normalized = file_path.replace("\\", "/").lstrip("/")
    return f"/uploads/{normalized}"


async def save_upload(
    file: UploadFile,
    subdirectory: str,
    settings: Settings | None = None,
) -> tuple[str, str]:
    settings = settings or get_settings()

    if subdirectory not in {"products", "company", "misc"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid upload directory")

    if file.content_type not in settings.allowed_image_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}",
        )

    content = await file.read()
    if len(content) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size of {settings.max_upload_size_mb}MB",
        )

    extension = Path(file.filename or "image.jpg").suffix.lower() or ".jpg"
    allowed_extensions = {
        "image/jpeg": {".jpg", ".jpeg"},
        "image/png": {".png"},
        "image/webp": {".webp"},
        "image/gif": {".gif"},
    }
    if extension not in allowed_extensions.get(file.content_type, set()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename extension does not match the image type",
        )
    filename = f"{uuid4()}{extension}"
    relative_path = f"{subdirectory}/{filename}"
    absolute_path = settings.upload_path / relative_path
    absolute_path.parent.mkdir(parents=True, exist_ok=True)
    absolute_path.write_bytes(content)

    return relative_path, filename


def delete_upload(file_path: str, settings: Settings | None = None) -> None:
    settings = settings or get_settings()
    absolute_path = settings.upload_path / file_path
    if absolute_path.exists():
        absolute_path.unlink()
