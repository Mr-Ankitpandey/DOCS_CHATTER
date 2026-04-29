from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserRead
from app.services import auth_service

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)) -> User:
    return await auth_service.register_user(db, user_in)


@router.post("/login", response_model=Token)
async def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Token:
    return await auth_service.login(db, email=form.username, password=form.password)


@router.get("/me", response_model=UserRead)
async def get_my_profile(current_user: User = Depends(get_current_user)) -> User:
    return current_user
