from uuid import UUID
from app.models.user import User
from app.db.session import AsyncSession
from sqlalchemy import select

async def create_user(db:AsyncSession, *, email:str, hashed_password : str, full_name : str | None) -> User:
    user = User(email = email, hashed_password = hashed_password, full_name= full_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def get_by_email(db:AsyncSession, email:str) -> User | None :
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def get_by_id(db:AsyncSession, id:UUID) -> User | None :
    result = await db.execute(select(User).where(User.id == id))
    return result.scalar_one_or_none()

