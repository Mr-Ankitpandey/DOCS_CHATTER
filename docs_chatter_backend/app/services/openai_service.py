from functools import lru_cache

from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from app.core.config import settings

EMBEDDING_MODEL = "text-embedding-3-small"
CHAT_MODEL = "gpt-4o-mini"


@lru_cache
def get_embeddings() -> OpenAIEmbeddings:
    return OpenAIEmbeddings(
        model=EMBEDDING_MODEL,
        api_key=settings.OPENAI_API_KEY.get_secret_value(),
    )


@lru_cache
def get_chat_model() -> ChatOpenAI:
    return ChatOpenAI(
        model=CHAT_MODEL,
        api_key=settings.OPENAI_API_KEY.get_secret_value(),
        temperature=0,
    )
