from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.retrieval.retriever import SemanticRetriever
from app.llm.generator import AnswerGenerator
from app.memory.manager import MemoryManager
from app.retrieval.router import QueryRouter
from app.retrieval.reranker import CrossEncoderReranker
import logging
import uuid

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

retriever = SemanticRetriever()
generator = AnswerGenerator()
memory_manager = MemoryManager()
query_router = QueryRouter()

# Reranker takes a few seconds to load models, so load globally
# Using a try/except so app doesn't crash if models aren't downloaded yet
try:
    reranker = CrossEncoderReranker()
except Exception as e:
    logger.warning(f"Could not load reranker: {e}")
    reranker = None

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    query: str
    top_k: int = 5
    book_name: Optional[str] = None
    subject: Optional[str] = None

@router.post("/")
async def chat_with_books(request: ChatRequest):
    """
    RAG Chat endpoint. Retrieves context and answers using LLM with conversational memory.
    """
    session_id = request.session_id or str(uuid.uuid4())
    logger.info(f"Received chat query: {request.query} for session: {session_id}")
    
    # 1. Rewrite Query (Memory)
    standalone_query = memory_manager.rewrite_query(session_id, request.query)
    
    # 2. Advanced Routing (Dynamic Metadata Filtering)
    dynamic_filters = query_router.route_query(standalone_query)
    
    # Merge explicit and dynamic filters
    filters = {**dynamic_filters}
    if request.book_name:
        filters["book_name"] = request.book_name
    if request.subject:
        filters["subject"] = request.subject
        
    try:
        # 3. Retrieve Context (Fetch more for reranking)
        fetch_k = request.top_k * 3 if reranker else request.top_k
        retrieved_chunks = retriever.search(
            query=standalone_query, 
            top_k=fetch_k, 
            filters=filters
        )
        
        # 4. Cross-Encoder Reranking
        if reranker and retrieved_chunks:
            retrieved_chunks = reranker.rerank(
                query=standalone_query,
                chunks=retrieved_chunks,
                top_k=request.top_k
            )
        
        # 5. Generate Answer
        if not retrieved_chunks:
            answer = "The information is not available in the provided textbooks."
            citations = []
        else:
            result = generator.generate_answer(
                query=standalone_query,
                retrieved_chunks=retrieved_chunks
            )
            answer = result["answer"]
            citations = result["citations"]
            
        # 4. Save to Memory
        memory_manager.add_message(session_id, "user", request.query)
        memory_manager.add_message(session_id, "assistant", answer)
        
        return {
            "session_id": session_id,
            "answer": answer,
            "citations": citations,
            "rewritten_query": standalone_query
        }
        
    except Exception as e:
        logger.error(f"Chat generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
