from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.voice import TranscriptionRead
from app.services import transcription_service

router = APIRouter(prefix="/voice", tags=["voice"])

ALLOWED_AUDIO_PREFIXES = ("audio/", "video/webm")


@router.post("/transcribe", response_model=TranscriptionRead)
async def transcribe_audio(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> TranscriptionRead:
    content_type = audio.content_type or ""
    if not content_type.startswith(ALLOWED_AUDIO_PREFIXES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only audio recordings are supported",
        )

    data = await audio.read()
    text = await transcription_service.transcribe(data, content_type)
    return TranscriptionRead(text=text)
