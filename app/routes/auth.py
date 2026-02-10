from datetime import timedelta
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.schemas.auth import MagicLinkRequest, RefreshTokenRequest, Token
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import authenticate_user, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _derive_company_name(email: str) -> str:
    domain = email.split("@")[1] if "@" in email else ""
    company = domain.split(".")[0] if domain else ""
    if not company:
        return "New Workspace"
    return " ".join(part.capitalize() for part in company.replace("-", " ").replace("_", " ").split())


@router.post("/register", response_model=UserRead)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    return register_user(db, user_in)


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(user.email)
    refresh_token = create_refresh_token(user.email)
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=int(timedelta(minutes=settings.access_token_expire_minutes).total_seconds()),
    )


@router.post("/magic-link", response_model=Token)
def magic_link(payload: MagicLinkRequest, db: Session = Depends(get_db)) -> Token:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        user = register_user(
            db,
            UserCreate(
                email=payload.email,
                password=secrets.token_urlsafe(24),
                company_name=_derive_company_name(payload.email),
            ),
        )
    access_token = create_access_token(user.email)
    refresh_token = create_refresh_token(user.email)
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=int(timedelta(minutes=settings.access_token_expire_minutes).total_seconds()),
    )


@router.post("/refresh", response_model=Token)
def refresh_token(payload: RefreshTokenRequest) -> Token:
    decoded = decode_token(payload.refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    access_token = create_access_token(decoded.get("sub"))
    refresh_token = create_refresh_token(decoded.get("sub"))
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=int(timedelta(minutes=settings.access_token_expire_minutes).total_seconds()),
    )
