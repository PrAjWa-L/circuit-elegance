from uuid import UUID

from pydantic import BaseModel


class UploadResponse(BaseModel):
    id: UUID | None = None
    url: str
    filename: str


class MultiUploadResponse(BaseModel):
    uploads: list[UploadResponse]
