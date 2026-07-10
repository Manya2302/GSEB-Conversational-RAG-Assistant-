from pydantic import BaseModel, Field
from typing import Optional

class ChunkMetadata(BaseModel):
    book_name: str
    subject: Optional[str] = None
    standard: Optional[str] = None
    chapter: Optional[str] = None
    page_number: int
    chunk_id: str

class DocumentChunk(BaseModel):
    text: str
    metadata: ChunkMetadata
