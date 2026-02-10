import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_admin
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserPasswordUpdate, UserRead, UserRoleUpdate

router = APIRouter(prefix="/users", tags=["users"])
logger = logging.getLogger(__name__)


@router.patch("/{user_id}/role", response_model=UserRead)
def update_user_role(
    user_id: int,
    role_in: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
) -> UserRead:
    user = (
        db.query(User)
        .filter(User.id == user_id, User.company_id == current_user.company_id)
        .first()
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = role_in.role
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Updated user role", extra={"user_id": user.id, "role": user.role})
    return user


@router.put("/me/password", response_model=UserRead)
def update_my_password(
    payload: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserRead:
    current_user.hashed_password = get_password_hash(payload.password)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    logger.info("Updated user password", extra={"user_id": current_user.id})
    return current_user
