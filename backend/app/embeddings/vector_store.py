from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from app.config import settings
from app.embeddings.embedder import Embedder
from app.models.document import DocumentChunk
import uuid
import logging

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self, collection_name: str = "textbooks"):
        self.collection_name = collection_name
        self.embedder = Embedder()
        if settings.QDRANT_HOST == "memory":
            self.client = QdrantClient(location=":memory:")
        else:
            self.client = QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT,
                api_key=settings.QDRANT_API_KEY if settings.QDRANT_API_KEY else None
            )
        self._ensure_collection()

    def _ensure_collection(self):
        """Creates the collection if it does not exist."""
        collections = self.client.get_collections().collections
        exists = any(c.name == self.collection_name for c in collections)
        
        if not exists:
            logger.info(f"Creating collection {self.collection_name}")
            # BAAI/bge-small-en-v1.5 has vector size 384
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE),
            )
            # Create payload index for metadata filtering
            self.client.create_payload_index(
                collection_name=self.collection_name,
                field_name="book_name",
                field_schema="keyword"
            )
        else:
            logger.info(f"Collection {self.collection_name} already exists")

    def add_chunks(self, chunks: list[DocumentChunk]):
        """Adds document chunks to the vector database in batches."""
        if not chunks:
            return
            
        logger.info(f"Embedding {len(chunks)} chunks")
        texts = [chunk.text for chunk in chunks]
        embeddings = self.embedder.embed_documents(texts)
        
        points = []
        for i, chunk in enumerate(chunks):
            # Qdrant requires UUIDs or integers for point IDs
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk.metadata.chunk_id))
            points.append(PointStruct(
                id=point_id,
                vector=embeddings[i],
                payload={"text": chunk.text, **chunk.metadata.model_dump()}
            ))
            
        logger.info(f"Upserting {len(points)} points to vector store")
        
        # Batch insert to handle large documents
        batch_size = 100
        for i in range(0, len(points), batch_size):
            batch = points[i:i + batch_size]
            self.client.upsert(
                collection_name=self.collection_name,
                points=batch
            )
        
        logger.info("Successfully added chunks to vector store")
