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
    
    # Process the PDF synchronously for now, 
    # to return the number of chunks created.
    try:
        chunks = pdf_processor.process_pdf(str(file_path), metadata)
        
        # We would store these chunks in a vector DB here (Phase 3)
        # For now we just return the counts
        
        return {
            "message": "File processed successfully",
            "filename": file.filename,
            "chunks_created": len(chunks),
            "metadata_extracted": metadata
        }
    except Exception as e:
        logger.error(f"Processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
