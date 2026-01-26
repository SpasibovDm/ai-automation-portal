from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.company import Company
from app.models.user import User
from app.schemas.user import UserCreate


def register_user(db: Session, user_in: UserCreate) -> User:
    company = db.query(Company).filter(Company.name == user_in.company_name).first()
    if not company:
        company = Company(name=user_in.company_name)
        db.add(company)
        db.commit()
        db.refresh(company)
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        company_id=company.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
