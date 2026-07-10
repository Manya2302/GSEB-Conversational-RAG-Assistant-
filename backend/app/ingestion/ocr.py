import easyocr
import logging
import numpy as np
import cv2

logger = logging.getLogger(__name__)

class MultilingualOCR:
    def __init__(self):
        logger.info("Initializing EasyOCR for English, Hindi, and Gujarati...")
        # Include 'en', 'hi', and 'gu' (Gujarati)
        self.reader = easyocr.Reader(['en', 'hi', 'gu'], gpu=False) # Fallback to CPU if no GPU

    def extract_text_from_image(self, image_bytes: bytes) -> str:
        """
        Extracts multilingual text (Gu, Hi, En) from raw image bytes using EasyOCR.
        """
        try:
            # Convert bytes to numpy array for OpenCV
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Preprocess: Convert to grayscale for better accuracy
            gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
            
            # Increase contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            contrast_img = clahe.apply(gray)
            
            # Read text
            results = self.reader.readtext(contrast_img, detail=0)
            extracted_text = " ".join(results)
            
            if extracted_text.strip():
                logger.info(f"EasyOCR extracted {len(extracted_text)} characters.")
                
            return extracted_text.strip()
            
        except Exception as e:
            logger.error(f"EasyOCR Error: {e}")
            return ""
