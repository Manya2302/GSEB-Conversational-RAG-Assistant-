from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import Optional, List
import shutil
from pathlib import Path
from app.ingestion.pdf_processor import PDFProcessor
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/upload", tags=["upload"])

UPLOAD_DIR = Path("data/pdfs")
# We resolve the path relative to the current working directory
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

pdf_processor = PDFProcessor()

@router.post("/")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    book_name: str = Form(...),
    subject: Optional[str] = Form(None),
    standard: Optional[str] = Form(None),
    chapter: Optional[str] = Form(None)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
    file_path = UPLOAD_DIR / file.filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    metadata = {
        "book_name": book_name,
        "subject": subject,
        "standard": standard,
        "chapter": chapter
    }
    
    # Store chunks in vector database in the background
    def process_and_store(file_path_str: str, meta: dict):
        try:
            chunks = pdf_processor.process_pdf(file_path_str, meta)
            from app.embeddings.vector_store import VectorStore
            vector_store = VectorStore()
            vector_store.add_chunks(chunks)
        except Exception as e:
            logger.error(f"Error in background processing: {str(e)}")

    background_tasks.add_task(process_and_store, str(file_path), metadata)
    
    return {
        "message": "File processing started in the background",
        "filename": file.filename,
        "metadata_extracted": metadata
    }

