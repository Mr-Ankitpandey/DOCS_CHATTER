from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DocumentInfo(BaseModel):
    id: UUID
    filename: str
    file_size: int
    mime_type: str
    status: str
    error_message: str | None = None
    summary: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ChatRead(BaseModel):
    id: UUID
    title: str | None = None
    document: DocumentInfo
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
