import asyncio
import uuid
from functools import lru_cache
from uuid import UUID

from langchain_community.document_loaders import Docx2txtLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.chunk import Chunk
from app.models.document import Document, DocumentStatus
from app.services.openai_service import get_chat_model, get_embeddings
from app.services.pinecone_service import get_index

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
SUMMARY_INPUT_LIMIT = 20000
PINECONE_BATCH_SIZE = 100


@lru_cache
def get_splitter():
    return RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
        length_function=len,
    )


def load_file(file_path: str, mime_type: str):
    if mime_type == "application/pdf":
        return PyPDFLoader(file_path).load()
    return Docx2txtLoader(file_path).load()


async def generate_summary(full_text: str) -> str:
    response = await get_chat_model().ainvoke(
        [
            (
                "system",
                "Summarize the following document in 3-5 concise sentences "
                "highlighting its main topics and content.",
            ),
            ("user", full_text[:SUMMARY_INPUT_LIMIT]),
        ]
    )
    return response.content


async def ingest_document(document_id: UUID) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Document).where(Document.id == document_id))
        document = result.scalar_one_or_none()
        if document is None:
            return

        try:
            document.status = DocumentStatus.PROCESSING
            await db.commit()

            lc_documents = load_file(document.file_path, document.mime_type)
            lc_chunks = get_splitter().split_documents(lc_documents)
            if not lc_chunks:
                raise ValueError("No text content extracted from file")

            texts = [c.page_content for c in lc_chunks]
            vectors, summary = await asyncio.gather(
                get_embeddings().aembed_documents(texts),
                generate_summary("\n\n".join(texts)),
            )

            pinecone_vectors = []
            for i, lc_chunk in enumerate(lc_chunks):
                chunk_id = uuid.uuid4()
                page = lc_chunk.metadata.get("page")

                metadata = {
                    "user_id": str(document.user_id),
                    "document_id": str(document.id),
                    "text": lc_chunk.page_content,
                }
                if page is not None:
                    metadata["page"] = page

                pinecone_vectors.append(
                    {"id": str(chunk_id), "values": vectors[i], "metadata": metadata}
                )
                db.add(
                    Chunk(
                        id=chunk_id,
                        document_id=document.id,
                        chunk_index=i,
                        content=lc_chunk.page_content,
                        page_number=page,
                    )
                )

            index = get_index()
            batches = [
                pinecone_vectors[i : i + PINECONE_BATCH_SIZE]
                for i in range(0, len(pinecone_vectors), PINECONE_BATCH_SIZE)
            ]
            await asyncio.gather(
                *(asyncio.to_thread(index.upsert, vectors=batch) for batch in batches)
            )
            document.summary = summary
            await db.commit()

            document.status = DocumentStatus.READY
            await db.commit()

        except Exception as exc:
            document.status = DocumentStatus.FAILED
            document.error_message = str(exc)
            await db.commit()
            raise
