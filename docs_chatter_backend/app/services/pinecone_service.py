import time
from functools import lru_cache

from pinecone import Pinecone, ServerlessSpec

from app.core.config import settings

EMBEDDING_DIMENSION = 1536

pc = Pinecone(api_key=settings.PINECONE_API_KEY.get_secret_value())


@lru_cache
def get_index():
    name = settings.PINECONE_INDEX_NAME

    if name not in pc.list_indexes().names():
        pc.create_index(
            name=name,
            dimension=EMBEDDING_DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        while not pc.describe_index(name).status["ready"]:
            time.sleep(1)

    return pc.Index(name)
