from pydantic import BaseModel, EmailStr, ConfigDict, Field, model_validator
from datetime import datetime
from uuid import UUID


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, min_length=2, max_length=100)

    @model_validator(mode="after")
    def validate_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str | None = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)