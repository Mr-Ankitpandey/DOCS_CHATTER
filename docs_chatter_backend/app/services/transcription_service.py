import httpx
from fastapi import HTTPException, status

from app.core.config import settings

DEEPGRAM_URL = "https://api.deepgram.com/v1/listen"
MAX_AUDIO_SIZE = 10 * 1024 * 1024  # 10 MB
REQUEST_TIMEOUT = 60.0


async def transcribe(audio: bytes, content_type: str) -> str:
    """Send recorded audio to Deepgram and return the transcript text."""
    if settings.DEEPGRAM_API_KEY is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Voice input is not configured on this server",
        )

    if not audio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty audio recording",
        )

    if len(audio) > MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Recording too large. Max size is {MAX_AUDIO_SIZE // (1024 * 1024)} MB",
        )

    params = {
        "model": settings.DEEPGRAM_MODEL,
        "smart_format": "true",
        "punctuate": "true",
    }
    headers = {
        "Authorization": f"Token {settings.DEEPGRAM_API_KEY.get_secret_value()}",
        "Content-Type": content_type or "audio/webm",
    }

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.post(
                DEEPGRAM_URL, params=params, headers=headers, content=audio
            )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach the transcription service",
        ) from exc

    if response.status_code != httpx.codes.OK:
        # Deepgram's body can echo request details, so don't forward it to the client.
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Transcription failed",
        )

    try:
        alternatives = response.json()["results"]["channels"][0]["alternatives"]
    except (KeyError, IndexError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unexpected response from the transcription service",
        ) from exc

    return alternatives[0].get("transcript", "").strip() if alternatives else ""
