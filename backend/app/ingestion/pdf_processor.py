import fitz  # PyMuPDF
from typing import List, Dict, Any
import logging
from app.ingestion.text_cleaner import clean_text, is_empty_page
from app.ingestion.chunker import DocumentChunker
from app.models.document import DocumentChunk

logger = logging.getLogger(__name__)

class PDFProcessor:
    def __init__(self):
        self.chunker = DocumentChunker()

    def process_pdf(self, file_path: str, metadata: Dict[str, Any]) -> List[DocumentChunk]:
        """
        Process a PDF file and return a list of document chunks.
        """
        logger.info(f"Processing PDF: {file_path}")
        all_chunks = []
        
        try:
            doc = fitz.open(file_path)
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text = page.get_text("text")
                
                if is_empty_page(text):
                    logger.debug(f"Skipping empty page: {page_num + 1}")
                    continue
                    
                cleaned_text = clean_text(text)
                
                # Page numbers are usually 1-indexed for users
                page_chunks = self.chunker.create_chunks(
                    text=cleaned_text,
                    base_metadata=metadata,
                    page_number=page_num + 1
                )
                
                all_chunks.extend(page_chunks)
                
            doc.close()
            logger.info(f"Successfully processed {file_path}. Created {len(all_chunks)} chunks.")
            
        except Exception as e:
            logger.error(f"Error processing PDF {file_path}: {str(e)}")
            raise
            
        return all_chunks
