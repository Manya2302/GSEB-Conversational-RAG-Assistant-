from sentence_transformers import CrossEncoder
import logging

logger = logging.getLogger(__name__)

class CrossEncoderReranker:
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        logger.info(f"Initializing CrossEncoder: {model_name}")
        # Use CPU for general compatibility unless environment specifies otherwise
        self.model = CrossEncoder(model_name, max_length=512, device='cpu')

    def rerank(self, query: str, chunks: list[dict], top_k: int = 5) -> list[dict]:
        if not chunks:
            return []
            
        logger.info(f"Reranking {len(chunks)} chunks with CrossEncoder for query: '{query}'")
        # Pair query with each chunk's text
        pairs = [[query, chunk["text"]] for chunk in chunks]
        
        # Predict scores
        scores = self.model.predict(pairs)
        
        # Attach scores to chunks and sort them descending
        for i, chunk in enumerate(chunks):
            chunk["rerank_score"] = float(scores[i])
            
        ranked_chunks = sorted(chunks, key=lambda x: x["rerank_score"], reverse=True)
        
        logger.info("Reranking complete.")
        return ranked_chunks[:top_k]
