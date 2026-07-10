from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.models.document import DocumentChunk, ChunkMetadata
import uuid

class DocumentChunker:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ".", " ", ""]
        )

    def create_chunks(self, text: str, base_metadata: dict, page_number: int) -> list[DocumentChunk]:
        chunks = self.text_splitter.split_text(text)
        document_chunks = []
        
        for i, chunk_text in enumerate(chunks):
            # Generate a unique ID based on book name, page, and a short UUID
            safe_book_name = str(base_metadata.get('book_name', 'unknown')).replace(" ", "_")
            chunk_id = f"{safe_book_name}_p{page_number}_c{i}_{uuid.uuid4().hex[:8]}"
            
            metadata = ChunkMetadata(
                book_name=base_metadata.get("book_name", "Unknown"),
                subject=base_metadata.get("subject"),
                standard=base_metadata.get("standard"),
                chapter=base_metadata.get("chapter"),
                page_number=page_number,
                chunk_id=chunk_id
            )
            
            document_chunks.append(DocumentChunk(
                text=chunk_text,
                metadata=metadata
            ))
            
        return document_chunks
