from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import user as user_repo
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.auth import Token


async def register_user(db:AsyncSession, user:UserCreate) -> User :
    result = await user_repo.get_by_email(db, user.email)
    if result is not None :
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail = "Email already registered"
        )
        
    hashed_password = hash_password(user.password)
    new_user = await user_repo.create_user(db, email=user.email, hashed_password=hashed_password, full_name=user.full_name)
    return new_user

async def authenticate(db:AsyncSession, email:str , password:str) -> User | None :
    user = await user_repo.get_by_email(db, email)
    if user is None:
        return None
    
    is_verified = verify_password(plain_password=password, hashed_password=user.hashed_password)
    if not is_verified:
        return None
    if user.is_active is False :
        return None
    return user
    

async def login(db:AsyncSession, email:str, password:str) -> Token :
    authenticated_user = await authenticate(db, email=email, password=password)
    if authenticated_user is None:
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = create_access_token(subject=str(authenticated_user.id))
    return Token(access_token=token, token_type="bearer")
