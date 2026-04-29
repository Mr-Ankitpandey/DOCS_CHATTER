from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


class ChunkInfo(BaseModel):
    id: UUID
    page_number: int | None = None
    content: str

    model_config = ConfigDict(from_attributes=True)


class MessageSourceInfo(BaseModel):
    chunk: ChunkInfo
    score: float | None = None

    model_config = ConfigDict(from_attributes=True)


class MessageRead(BaseModel):
    id: UUID
    role: str
    content: str
    sources: list[MessageSourceInfo] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
