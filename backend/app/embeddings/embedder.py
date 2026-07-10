from langchain_huggingface import HuggingFaceEmbeddings
from functools import lru_cache

class Embedder:
    def __init__(self):
        model_name = "BAAI/bge-small-en-v1.5"
        model_kwargs = {"device": "cpu"} # Using CPU for compatibility
        encode_kwargs = {"normalize_embeddings": True}
        
        self.embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs=model_kwargs,
            encode_kwargs=encode_kwargs
        )
        
    def get_embedding_model(self):
        return self.embeddings
        
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self.embeddings.embed_documents(texts)
        
    def embed_query(self, text: str) -> list[float]:
        return self.embeddings.embed_query(text)
        
    @lru_cache(maxsize=1000)
    def embed_query_cached(self, text: str) -> list[float]:
        """Cached version of query embedding to improve performance on repeated queries."""
        return self.embed_query(text)
