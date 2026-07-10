from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from app.embeddings.vector_store import VectorStore
import logging

logger = logging.getLogger(__name__)

class SemanticRetriever:
    def __init__(self):
        self.vector_store = VectorStore()
        
    def search(self, query: str, top_k: int = 5, filters: dict = None):
        """
        Retrieves top_k most similar chunks for the given query.
        Applies metadata filtering if filters dict is provided.
        """
        logger.info(f"Retrieving top {top_k} chunks for query: '{query}'")
        
        # Embed the query string using the cache to save compute on repeated queries
        query_vector = self.vector_store.embedder.embed_query_cached(query)
        
        # Build Qdrant metadata filters if provided
        qdrant_filter = None
        if filters:
            must_conditions = []
            for key, value in filters.items():
                if value:
                    must_conditions.append(
                        FieldCondition(
                            key=key,
                            match=MatchValue(value=value)
                        )
                    )
            if must_conditions:
                qdrant_filter = Filter(must=must_conditions)
                
        # Perform vector search in Qdrant
        results = self.vector_store.client.search(
            collection_name=self.vector_store.collection_name,
            query_vector=query_vector,
            query_filter=qdrant_filter,
            limit=top_k,
            with_payload=True
        )
        
        # Format and return the results
        retrieved_chunks = []
        for res in results:
            retrieved_chunks.append({
                "score": res.score,
                "text": res.payload.get("text"),
                "book_name": res.payload.get("book_name"),
                "page_number": res.payload.get("page_number"),
                "chapter": res.payload.get("chapter"),
                "subject": res.payload.get("subject"),
                "standard": res.payload.get("standard")
            })
            
        logger.info(f"Found {len(retrieved_chunks)} relevant chunks")
        return retrieved_chunks
