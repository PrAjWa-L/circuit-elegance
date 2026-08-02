from datetime import UTC, datetime, timedelta
from hashlib import sha256
from secrets import token_urlsafe
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.models import AdminUser, RefreshToken

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def _hash_token(token: str) -> str:
    return sha256(token.encode()).hexdigest()


def create_access_token(subject: UUID, settings: Settings | None = None) -> str:
    settings = settings or get_settings()
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(subject), "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(user_id: UUID, db: Session, settings: Settings | None = None) -> str:
    settings = settings or get_settings()
    raw_token = token_urlsafe(48)
    expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)

    db.add(
        RefreshToken(
            user_id=user_id,
            token_hash=_hash_token(raw_token),
            expires_at=expires_at,
        )
    )
    db.commit()
    return raw_token


def decode_access_token(token: str, settings: Settings | None = None) -> UUID:
    settings = settings or get_settings()
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("type") != "access":
            raise ValueError("Invalid token type")
        return UUID(payload["sub"])
    except (JWTError, KeyError, ValueError) as exc:
        raise ValueError("Invalid access token") from exc


def validate_refresh_token(raw_token: str, db: Session) -> RefreshToken:
    token_hash = _hash_token(raw_token)
    record = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked.is_(False),
        )
        .first()
    )
    if not record or record.expires_at < datetime.now(UTC):
        raise ValueError("Invalid or expired refresh token")
    return record


def revoke_refresh_token(record: RefreshToken, db: Session) -> None:
    record.revoked = True
    db.commit()


def authenticate_admin(db: Session, email: str, password: str) -> AdminUser | None:
    user = db.query(AdminUser).filter(AdminUser.email == email, AdminUser.is_active.is_(True)).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user
