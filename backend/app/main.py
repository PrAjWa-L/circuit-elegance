from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import app.api.routes  # noqa: F401
from app.api.router import api_router
from app.core.config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    upload_path = Path(settings.upload_dir)
    for subdir in ("products", "company", "misc"):
        (upload_path / subdir).mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
