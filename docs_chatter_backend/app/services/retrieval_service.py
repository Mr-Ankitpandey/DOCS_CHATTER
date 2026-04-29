from uuid import UUID

from langchain_community.retrievers import BM25Retriever
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chunk import Chunk
from app.services.openai_service import get_embeddings
from app.services.pinecone_service import get_index

RRF_K = 60


async def hybrid_search(
    db: AsyncSession,
    query: str,
    document_id: UUID,
    top_k: int = 5,
) -> list[tuple[UUID, str, float]]:
    query_vec = await get_embeddings().aembed_query(query) #Convert the user's question to a vector.
    
    semantic_response = get_index().query(
        vector=query_vec,
        top_k=top_k * 2,
        include_metadata=True,
        filter={"document_id": str(document_id)},
    )
    semantic_ranking = [
        (UUID(m["id"]), m["metadata"]["text"]) for m in semantic_response["matches"]
    ]

    rows = (
        await db.execute(select(Chunk).where(Chunk.document_id == document_id))
    ).scalars().all()
    if not rows:
        return []

    bm25 = BM25Retriever.from_texts(
        texts=[c.content for c in rows],
        metadatas=[{"id": str(c.id)} for c in rows],
    )
    bm25.k = top_k * 2
    bm25_results = bm25.invoke(query)
    bm25_ranking = [
        (UUID(d.metadata["id"]), d.page_content) for d in bm25_results
    ]

    scores: dict[UUID, float] = {}
    texts: dict[UUID, str] = {}
    for rank, (cid, text) in enumerate(semantic_ranking):
        scores[cid] = scores.get(cid, 0) + 1 / (RRF_K + rank + 1)
        texts[cid] = text
    for rank, (cid, text) in enumerate(bm25_ranking):
        scores[cid] = scores.get(cid, 0) + 1 / (RRF_K + rank + 1)
        if cid not in texts:
            texts[cid] = text

    top_ids = sorted(scores, key=lambda cid: scores[cid], reverse=True)[:top_k]
    return [(cid, texts[cid], scores[cid]) for cid in top_ids]
