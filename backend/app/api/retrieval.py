from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel
from app.retrieval.retriever import SemanticRetriever

router = APIRouter(prefix="/api/v1/retrieval", tags=["retrieval"])
retriever = SemanticRetriever()

class RetrievalRequest(BaseModel):
    query: str
    top_k: int = 5
    book_name: Optional[str] = None
    subject: Optional[str] = None
    standard: Optional[str] = None
    chapter: Optional[str] = None

@router.post("/")
async def retrieve_context(request: RetrievalRequest):
    """
    Search the vector database for chunks most relevant to the query.
    Can be filtered by metadata like book_name, subject, etc.
    """
    filters = {}
    if request.book_name:
        filters["book_name"] = request.book_name
    if request.subject:
        filters["subject"] = request.subject
    if request.standard:
        filters["standard"] = request.standard
    if request.chapter:
        filters["chapter"] = request.chapter
        
    try:
        results = retriever.search(
            query=request.query, 
            top_k=request.top_k, 
            filters=filters
        )
        return {"query": request.query, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
