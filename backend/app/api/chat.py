from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.retrieval.retriever import SemanticRetriever
from app.llm.generator import AnswerGenerator
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

retriever = SemanticRetriever()
generator = AnswerGenerator()

class ChatRequest(BaseModel):
    query: str
    top_k: int = 5
    book_name: Optional[str] = None
    subject: Optional[str] = None

@router.post("/")
async def chat_with_books(request: ChatRequest):
    """
    RAG Chat endpoint. Retrieves relevant context and generates an answer using an LLM.
    """
    logger.info(f"Received chat query: {request.query}")
    
    # 1. Retrieve Context
    filters = {}
    if request.book_name:
        filters["book_name"] = request.book_name
    if request.subject:
        filters["subject"] = request.subject
        
    try:
        retrieved_chunks = retriever.search(
            query=request.query, 
            top_k=request.top_k, 
            filters=filters
        )
        
        # 2. Generate Answer
        if not retrieved_chunks:
            return {
                "answer": "The information is not available in the provided textbooks.",
                "citations": []
            }
            
        result = generator.generate_answer(
            query=request.query,
            retrieved_chunks=retrieved_chunks
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Chat generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
