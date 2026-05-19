import uuid
from collections.abc import AsyncGenerator
# from pathlib import Path
from typing import Any
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import create_client
import os

from app.models.chunk import Chunk
from app.models.conversation import Conversation
from app.models.document import Document, DocumentStatus
from app.models.message import Message
from app.models.message_source import MessageSource
from app.models.user import User
from app.repositories import conversation as conv_repo
from app.repositories import message as message_repo
from app.services import retrieval_service
from app.services.openai_service import get_chat_model

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# UPLOAD_DIR = Path("uploads")
MAX_FILE_SIZE = 25 * 1024 * 1024
ALLOWED_MIME_TYPES: dict[str, str] = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}

SYSTEM_PROMPT = (
    "You are a helpful assistant answering questions about a document the user uploaded. "
    "Use ONLY the provided document to answer; if the document doesn't contain the answer, say so clearly. "
    "Provide complete, self-contained answers — include the specific facts, numbers, and quotes "
    "from the document directly in your response. Do not tell the user to 'see section X' or "
    "'refer to the table' — extract the information and put it in your reply. "
    "Always refer to the source as 'the document' (never 'the context' or 'the provided text'). "
    "Be concise and accurate."
)


async def create_chat(db: AsyncSession, *, user: User, file: UploadFile) -> Conversation:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are supported",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size is {MAX_FILE_SIZE // (1024 * 1024)} MB",
        )

    document_id = uuid.uuid4()
    extension = ALLOWED_MIME_TYPES[file.content_type]
    # user_dir = UPLOAD_DIR / str(user.id)
    # user_dir.mkdir(parents=True, exist_ok=True)
    # file_path = user_dir / f"{document_id}.{extension}"
    # file_path.write_bytes(content)
    file_name = f"{user.id}/{document_id}.{extension}"

    supabase.storage.from_("documents").upload(
    file_name,
    content,
    {"content-type": file.content_type}
    )

    # file_url = supabase.storage.from_("documents").get_public_url(file_name)

    try:
        document = Document(
            id=document_id,
            user_id=user.id,
            # filename=file.filename or file_path.name,
            filename=file.filename or file_name,
            # file_path=str(file_path),
            file_path=file_name,
            file_size=len(content),
            mime_type=file.content_type,
        )
        db.add(document)

        title = (file.filename or "New chat").rsplit(".", 1)[0] or "New chat"
        conversation = Conversation(
            user_id=user.id,
            document_id=document_id,
            title=title,
        )
        db.add(conversation)

        await db.commit()
        await db.refresh(conversation, ["document"])
        return conversation
    except Exception:
        # file_path.unlink(missing_ok=True)
        supabase.storage.from_("documents").remove([file_name])
        raise


async def list_chats(db: AsyncSession, user: User) -> list[Conversation]:
    return await conv_repo.list_by_user(db, user.id)


async def get_chat(db: AsyncSession, user: User, chat_id: UUID) -> Conversation:
    conv = await conv_repo.get_by_user_and_id(db, user.id, chat_id)
    if conv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )
    return conv


# async def delete_chat(db: AsyncSession, user: User, chat_id: UUID) -> None:
#     conv = await conv_repo.get_by_user_and_id(db, user.id, chat_id)
#     if conv is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Chat not found",
#         )

#     file_path = Path(conv.document.file_path)
#     document = conv.document

#     await db.delete(conv)
#     await db.delete(document)
#     await db.commit()

#     # file_path.unlink(missing_ok=True)
#     supabase.storage.from_("documents").remove([file_name])

async def delete_chat(db: AsyncSession, user: User, chat_id: UUID) -> None:
    conv = await conv_repo.get_by_user_and_id(db, user.id, chat_id)

    if conv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )

    document = conv.document

    await db.delete(conv)
    await db.delete(document)
    await db.commit()

    supabase.storage.from_("documents").remove(
        [document.file_path]
    )


async def list_messages(db: AsyncSession, user: User, chat_id: UUID) -> list[Message]:
    conv = await conv_repo.get_by_user_and_id(db, user.id, chat_id)
    if conv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found"
        )
    return await message_repo.list_by_conversation(db, conv.id)


async def stream_send_message(
    db: AsyncSession, user: User, chat_id: UUID, query: str
) -> AsyncGenerator[dict[str, Any], None]:
    conv = await conv_repo.get_by_user_and_id(db, user.id, chat_id)
    if conv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found"
        )
    if conv.document.status != DocumentStatus.READY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document is still being processed",
        )

    history = await message_repo.list_recent(db, conv.id, limit=8)
    db.add(Message(conversation_id=conv.id, role="user", content=query))

    chunks = await retrieval_service.hybrid_search(db, query, conv.document_id)
    context = "\n\n".join(f"[Source {i+1}]\n{text}" for i, (_, text, _) in enumerate(chunks))

    llm_messages = [
        ("system", SYSTEM_PROMPT),
        ("system", f"Document content:\n\n{context}"),
        *[(m.role, m.content) for m in history],
        ("user", query),
    ]

    full_answer = ""
    async for piece in get_chat_model().astream(llm_messages):
        token = piece.content
        if not token:
            continue
        full_answer += token
        yield {"type": "token", "content": token}

    assistant_msg = Message(conversation_id=conv.id, role="assistant", content=full_answer)
    db.add(assistant_msg)
    await db.flush()
    for chunk_id, _, score in chunks:
        db.add(
            MessageSource(message_id=assistant_msg.id, chunk_id=chunk_id, score=score)
        )
    await db.commit()

    chunk_ids = [cid for cid, _, _ in chunks]
    chunk_rows = (
        await db.execute(select(Chunk).where(Chunk.id.in_(chunk_ids)))
    ).scalars().all()
    sources_payload = [
        {
            "chunk": {
                "id": str(c.id),
                "page_number": c.page_number,
                "content": c.content,
            },
            "score": next((s for cid, _, s in chunks if cid == c.id), None),
        }
        for c in chunk_rows
    ]

    yield {
        "type": "done",
        "message_id": str(assistant_msg.id),
        "sources": sources_payload,
    }
