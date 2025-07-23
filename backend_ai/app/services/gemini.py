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
            "reasoning": "penjelasan detail mengapa AI memberikan prediksi tersebut berdasarkan visual yang terlihat",
            "confidence": nilai kepercayaan 0-1 (float)
        }

        Pertimbangkan faktor-faktor berikut dalam analisis:
        - Warna dan tekstur makanan
        - Tanda-tanda kesegaran atau pembusukan
        - Jenis makanan dan daya tahan umumnya
        - Kondisi penyimpanan yang terlihat

        Untuk predicted_remaining_days, berikan estimasi berapa hari lagi makanan ini akan aman dikonsumsi.
        Untuk reasoning, berikan penjelasan yang mudah dipahami tentang mengapa prediksi tersebut diberikan.

        Berikan prediksi yang realistis dan konservatif untuk keamanan makanan.
        Respons harus dalam bahasa Indonesia untuk deskripsi dan reasoning.
        """

    def _parse_gemini_response(self, response_text: str) -> dict:
        """Parse JSON response from Gemini."""
        try:
            # Clean up response text
            if response_text.startswith("```json"):
                response_text = response_text.replace(
                    "```json", "").replace("```", "").strip()
            elif response_text.startswith("```"):
                response_text = response_text.replace("```", "").strip()

            # Remove any leading/trailing whitespace
            response_text = response_text.strip()

            # Try to parse JSON
            result = json.loads(response_text)

            # Validate response structure
            required_fields = ["item_name", "condition_description",
                               "predicted_remaining_days", "reasoning", "confidence"]
            for field in required_fields:
                if field not in result:
                    logger.warning(
                        f"Field '{field}' tidak ditemukan dalam respons, menggunakan nilai default")
                    # Provide default values
                    if field == "item_name":
                        result[field] = "Makanan Tidak Dikenal"
                    elif field == "condition_description":
                        result[field] = "Kondisi tidak dapat dianalisis"
                    elif field == "predicted_remaining_days":
                        result[field] = 1
                    elif field == "reasoning":
                        result[field] = "Analisis tidak tersedia"
                    elif field == "confidence":
                        result[field] = 0.5

            # Ensure proper types
            result["predicted_remaining_days"] = int(
                result["predicted_remaining_days"])
            result["confidence"] = float(result["confidence"])

            return result

        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON dari Gemini: {e}")
            logger.error(f"Raw response: {response_text}")

            # Try to create a fallback response if JSON parsing fails
            return {
                "item_name": "Makanan Tidak Dikenal",
                "condition_description": "Kondisi tidak dapat dianalisis",
                "predicted_remaining_days": 1,
                "reasoning": "Respons AI tidak dapat diproses dengan benar",
                "confidence": 0.3
            }

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
                predicted_remaining_days=int(
                    result["predicted_remaining_days"]),
                reasoning=result["reasoning"],
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
