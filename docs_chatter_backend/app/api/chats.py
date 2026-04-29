import json
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.schemas.chat import ChatRead
from app.schemas.message import MessageCreate, MessageRead
from app.services import chat_service
from app.services.ingestion_service import ingest_document

router = APIRouter(prefix="/chats", tags=["chats"])


@router.post("", response_model=ChatRead, status_code=status.HTTP_201_CREATED)
async def create_chat(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Conversation:
    chat = await chat_service.create_chat(db, user=current_user, file=file)
    background_tasks.add_task(ingest_document, chat.document.id)
    return chat


@router.get("", response_model=list[ChatRead])
async def list_chats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Conversation]:
    return await chat_service.list_chats(db, current_user)


@router.get("/{chat_id}", response_model=ChatRead)
async def get_chat(
    chat_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Conversation:
    return await chat_service.get_chat(db, current_user, chat_id)


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
    chat_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    await chat_service.delete_chat(db, current_user, chat_id)


@router.get("/{chat_id}/messages", response_model=list[MessageRead])
async def list_messages(
    chat_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Message]:
    return await chat_service.list_messages(db, current_user, chat_id)


@router.post("/{chat_id}/messages")
async def send_message(
    chat_id: UUID,
    body: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    async def event_stream():
        async for event in chat_service.stream_send_message(
            db, current_user, chat_id, body.content
        ):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
