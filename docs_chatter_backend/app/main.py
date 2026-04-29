from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chats, users
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(chats.router, prefix=settings.API_PREFIX)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.ENVIRONMENT}
