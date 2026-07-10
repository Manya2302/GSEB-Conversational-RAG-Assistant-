import fitz  # PyMuPDF
from typing import List, Dict, Any
import logging
import asyncio
from app.ingestion.text_cleaner import clean_text, is_empty_page
from app.ingestion.chunker import DocumentChunker
from app.models.document import DocumentChunk
from app.ingestion.image_analyzer import ImageAnalyzer

logger = logging.getLogger(__name__)

class PDFProcessor:
    def __init__(self):
        self.chunker = DocumentChunker()
        self.image_analyzer = ImageAnalyzer()

    async def process_pdf_async(self, file_path: str, metadata: Dict[str, Any]) -> List[DocumentChunk]:
        """
        Process a PDF file asynchronously (extracts text and images) and returns document chunks.
        """
        logger.info(f"Processing PDF: {file_path}")
        all_chunks = []
        image_tasks = []
        
        try:
            doc = fitz.open(file_path)
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # 1. Text Extraction
                text = page.get_text("text")
                if not is_empty_page(text):
                    cleaned_text = clean_text(text)
                    page_chunks = self.chunker.create_chunks(
                        text=cleaned_text,
                        base_metadata=metadata,
                        page_number=page_num + 1
                    )
                    all_chunks.extend(page_chunks)
                
                # 2. Image Extraction
                image_list = page.get_images(full=True)
                for img_index, img in enumerate(image_list):
                    xref = img[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    # Schedule image analysis
                    task = self._analyze_and_chunk_image(
                        image_bytes=image_bytes,
                        metadata=metadata,
                        page_number=page_num + 1,
                        img_index=img_index
                    )
                    image_tasks.append(task)
                    
            doc.close()
            
            # 3. Wait for all fast Groq vision tasks to finish concurrently
            if image_tasks:
                logger.info(f"Analyzing {len(image_tasks)} images concurrently via Groq Vision...")
                image_chunks = await asyncio.gather(*image_tasks)
                for chunks in image_chunks:
                    all_chunks.extend(chunks)
                    
            logger.info(f"Successfully processed {file_path}. Created {len(all_chunks)} total chunks.")
            
        except Exception as e:
            logger.error(f"Error processing PDF {file_path}: {str(e)}")
            raise
            
        return all_chunks

    async def _analyze_and_chunk_image(self, image_bytes: bytes, metadata: dict, page_number: int, img_index: int):
        description = await self.image_analyzer.analyze_image_bytes(image_bytes)
        if description:
            return self.chunker.create_chunks(
                text=description,
                base_metadata=metadata,
                page_number=page_number
            )
        return []

    def process_pdf(self, file_path: str, metadata: Dict[str, Any]) -> List[DocumentChunk]:
        """Synchronous wrapper for legacy support"""
        return asyncio.run(self.process_pdf_async(file_path, metadata))
