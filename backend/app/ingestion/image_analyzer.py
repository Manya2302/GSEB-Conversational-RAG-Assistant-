import os
import base64
import asyncio
from groq import AsyncGroq
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class ImageAnalyzer:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        if self.api_key:
            self.client = AsyncGroq(api_key=self.api_key)
        else:
            self.client = None

    async def analyze_image_bytes(self, image_bytes: bytes) -> str:
        if not self.client:
            return ""

        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        prompt = "Analyze this textbook figure/image carefully. If there is a figure number (like 'Figure 11.4'), state it clearly. Describe what the image shows in detail. Extract any important text, labels, or diagrams present."
        
        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                },
                            },
                        ],
                    }
                ],
                model="llama-3.2-11b-vision-preview",
                temperature=0.1,
                max_tokens=512
            )
            description = chat_completion.choices[0].message.content
            logger.info(f"Successfully analyzed image. Description length: {len(description)}")
            return f"[IMAGE DESCRIPTION] {description}"
        except Exception as e:
            logger.error(f"Error analyzing image with Groq Vision: {e}")
            return ""
