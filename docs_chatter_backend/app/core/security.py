from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
from app.schemas.auth import TokenPayload

pwd_context = CryptContext(schemes=["bcrypt"], deprecated = "auto")

SECRET_KEY = settings.SECRET_KEY.get_secret_value()
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

def hash_password(password:str) -> str :
    """Takes string password as input and return the hashed password """
    return pwd_context.hash(password)

def verify_password(plain_password : str, hashed_password:str)-> bool :
    """Compare password and returns a boolean"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject : str, expires_delta:Optional[timedelta] = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "sub" : subject,
        "exp" : expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_access_token(token:str)->TokenPayload | None :
    
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        subject = payload.get("sub")
        exp = payload.get("exp")

        if subject is None or exp is None:
            return None

        return TokenPayload(sub=subject, exp=exp)

    except JWTError:
        return None