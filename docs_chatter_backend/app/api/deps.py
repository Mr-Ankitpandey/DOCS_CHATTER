from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import verify_access_token
from app.db.session import get_db
from app.models.user import User
from app.repositories import user as user_repo

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/users/login")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    payload = verify_access_token(token)
    if payload is None:
        raise credentials_exception

    try:
        user_id = UUID(payload.sub)
    except ValueError:
        raise credentials_exception

    user = await user_repo.get_by_id(db, user_id)
    if user is None:
        raise credentials_exception

    return user
