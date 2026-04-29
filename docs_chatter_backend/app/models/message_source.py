import uuid

from sqlalchemy import Float, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.chunk import Chunk


class MessageSource(Base):
    __tablename__ = "message_sources"
    __table_args__ = (PrimaryKeyConstraint("message_id", "chunk_id"),)

    message_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("messages.id", ondelete="CASCADE"),
    )
    chunk_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chunks.id", ondelete="CASCADE"),
    )
    score: Mapped[float | None] = mapped_column(Float)

    chunk: Mapped[Chunk] = relationship(lazy="selectin")
