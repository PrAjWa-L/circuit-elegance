from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.auth.security import (
    authenticate_admin,
    create_access_token,
    create_refresh_token,
    revoke_refresh_token,
    validate_refresh_token,
)
from app.database import get_db
from app.models import AdminUser
from app.schemas.auth import AdminUserResponse, LoginRequest, RefreshRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    from app.core.config import get_settings

    settings = get_settings()
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.app_env.lower() == "production",
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path=f"{settings.api_v1_prefix}/auth",
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    user = authenticate_admin(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    refresh_token = create_refresh_token(user.id, db)
    _set_refresh_cookie(response, refresh_token)
    return TokenResponse(access_token=create_access_token(user.id), refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    payload: RefreshRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> TokenResponse:
    refresh_token = payload.refresh_token or request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is required")
    try:
        record = validate_refresh_token(refresh_token, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    user = db.query(AdminUser).filter(AdminUser.id == record.user_id, AdminUser.is_active.is_(True)).first()
    if not user:
        revoke_refresh_token(record, db)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    revoke_refresh_token(record, db)
    new_refresh_token = create_refresh_token(record.user_id, db)
    _set_refresh_cookie(response, new_refresh_token)
    return TokenResponse(access_token=create_access_token(record.user_id), refresh_token=new_refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(payload: RefreshRequest, request: Request, response: Response, db: Session = Depends(get_db)) -> None:
    refresh_token = payload.refresh_token or request.cookies.get("refresh_token")
    from app.core.config import get_settings

    response.delete_cookie("refresh_token", path=f"{get_settings().api_v1_prefix}/auth")
    if not refresh_token:
        return
    try:
        record = validate_refresh_token(refresh_token, db)
    except ValueError:
        return
    revoke_refresh_token(record, db)


@router.get("/me", response_model=AdminUserResponse)
def me(current_admin: AdminUser = Depends(get_current_admin)) -> AdminUser:
    return current_admin
