import json
import logging
import os
import io
from typing import Optional
from fastapi import HTTPException, UploadFile
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv

from ..models import PredictResponse

load_dotenv()
logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self._configure_api()
    
    def _configure_api(self):
        """Configure Gemini API."""
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                logger.info("Gemini API configured successfully")
            except Exception as e:
                logger.error(f"Failed to configure Gemini: {e}")
        else:
            logger.warning("GEMINI_API_KEY not found in environment variables")
    
    def is_available(self) -> bool:
        """Check if Gemini API is available."""
        return self.api_key is not None
    
    async def _process_image(self, file: UploadFile) -> Image.Image:
        """Process uploaded file for Gemini."""
        content = await file.read()
        return Image.open(io.BytesIO(content))
    
    def _create_prompt(self) -> str:
        """Create detailed prompt for Gemini."""
        return """
        Analisis gambar makanan ini dengan detail dan berikan respons dalam format JSON dengan struktur berikut:

        {
            "item_name": "nama makanan/bahan makanan utama",
            "condition_description": "deskripsi kondisi makanan (segar, layu, busuk, dll)",
            "predicted_remaining_days": angka hari (integer) prediksi daya tahan,
            "confidence": nilai kepercayaan 0-1 (float)
        }

        Pertimbangkan faktor-faktor berikut dalam analisis:
        - Warna dan tekstur makanan
        - Tanda-tanda kesegaran atau pembusukan
        - Jenis makanan dan daya tahan umumnya
        - Kondisi penyimpanan yang terlihat

        Berikan prediksi yang realistis dan konservatif untuk keamanan makanan.
        Respons harus dalam bahasa Indonesia untuk deskripsi.
        """
    
    def _parse_gemini_response(self, response_text: str) -> dict:
        """Parse JSON response from Gemini."""
        try:
            # Clean up response text
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()
            
            result = json.loads(response_text)
            
            # Validate response structure
            required_fields = ["item_name", "condition_description", "predicted_remaining_days", "confidence"]
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Field '{field}' tidak ditemukan dalam respons")
            
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON dari Gemini: {e}")
            logger.error(f"Raw response: {response_text}")
            raise HTTPException(
                status_code=500,
                detail="Respons dari AI tidak dalam format yang valid"
            )
    
    async def predict_item(self, file: UploadFile) -> PredictResponse:
        """Analyze food image comprehensively using Gemini AI."""
        if not self.is_available():
            raise HTTPException(
                status_code=500,
                detail="Gemini API tidak tersedia"
            )
        
        try:
            # Process image for Gemini
            image = await self._process_image(file)
            
            # Initialize Gemini model
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Create prompt
            prompt = self._create_prompt()
            
            # Generate response from Gemini
            response = model.generate_content([prompt, image])
            
            # Parse JSON response
            result = self._parse_gemini_response(response.text)
            
            return PredictResponse(
                item_name=result["item_name"],
                condition_description=result["condition_description"],
                predicted_remaining_days=int(result["predicted_remaining_days"]),
                confidence=float(result["confidence"])
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in gemini service: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Terjadi kesalahan dalam layanan Gemini: {str(e)}"
            )