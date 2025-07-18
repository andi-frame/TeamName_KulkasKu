import logging
import json
import io
from typing import Optional
from fastapi import HTTPException, UploadFile
from google.cloud import vision
from PIL import Image
import google.generativeai as genai
import os
from dotenv import load_dotenv

from ..models import IdentifyResponse

load_dotenv()
logger = logging.getLogger(__name__)


class VisionService:
    def __init__(self):
        self.vision_client = self._initialize_vision_client()
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self._configure_gemini()

    def _initialize_vision_client(self) -> Optional[vision.ImageAnnotatorClient]:
        """Initialize Google Cloud Vision client."""
        try:
            client = vision.ImageAnnotatorClient()
            logger.info("Google Cloud Vision client initialized successfully")
            return client
        except Exception as e:
            logger.error(f"Failed to initialize Vision client: {e}")
            return None

    def _configure_gemini(self):
        """Configure Gemini API as fallback."""
        if self.gemini_api_key:
            try:
                genai.configure(api_key=self.gemini_api_key)
                logger.info("Gemini API configured as fallback")
            except Exception as e:
                logger.error(f"Failed to configure Gemini fallback: {e}")
        else:
            logger.warning("GEMINI_API_KEY not found - no fallback available")

    def is_available(self) -> bool:
        """Check if either Vision API or Gemini is available."""
        return self.vision_client is not None or self.gemini_api_key is not None

    def _is_vision_billing_error(self, error_message: str) -> bool:
        """Check if error is related to billing/quota issues."""
        billing_keywords = [
            "billing", "quota", "exceeded", "disabled", "permission denied",
            "forbidden", "authentication", "credentials", "unauthorized",
            "service account", "project", "enable", "api not enabled",
            "billing_disabled", "requires billing to be enabled"
        ]
        error_lower = error_message.lower()
        return any(keyword in error_lower for keyword in billing_keywords)

    async def _process_image_for_vision(self, file: UploadFile) -> vision.Image:
        """Process uploaded file for Google Cloud Vision."""
        content = await file.read()
        return vision.Image(content=content)

    async def _process_image_for_gemini(self, file: UploadFile) -> Image.Image:
        """Process uploaded file for Gemini."""
        file.file.seek(0)  # Reset file pointer
        content = await file.read()
        return Image.open(io.BytesIO(content))

    def _create_identification_prompt(self) -> str:
        """Create prompt for Gemini to identify objects."""
        return """
        Identifikasi objek utama dalam gambar ini dan berikan respons dalam format JSON dengan struktur berikut:

        {
            "name": "nama objek utama yang teridentifikasi",
            "confidence": nilai kepercayaan 0-1 (float)
        }

        Fokus pada objek yang paling dominan dan jelas terlihat dalam gambar.
        Berikan nama objek dalam bahasa Indonesia.
        Berikan confidence score yang realistis berdasarkan kejelasan objek.
        """

    def _parse_gemini_identification_response(self, response_text: str) -> dict:
        """Parse JSON response from Gemini for identification."""
        try:
            # Clean up response text
            if response_text.startswith("```json"):
                response_text = response_text.replace(
                    "```json", "").replace("```", "").strip()

            result = json.loads(response_text)

            # Validate response structure
            if "name" not in result or "confidence" not in result:
                raise ValueError("Response tidak memiliki struktur yang benar")

            return result

        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON dari Gemini: {e}")
            logger.error(f"Raw response: {response_text}")
            # Return fallback response
            return {
                "name": "Objek tidak teridentifikasi",
                "confidence": 0.3
            }

    async def _identify_with_vision(self, file: UploadFile) -> IdentifyResponse:
        """Identify using Google Cloud Vision API."""
        try:
            # Process image for Vision API
            image = await self._process_image_for_vision(file)

            # Call Vision API for label detection
            response = self.vision_client.label_detection(image=image)

            if response.error.message:
                error_msg = response.error.message
                logger.error(f"Vision API error: {error_msg}")
                if self._is_vision_billing_error(error_msg):
                    logger.warning(
                        f"Vision API billing/quota error detected: {error_msg}")
                    raise Exception(f"BILLING_ERROR: {error_msg}")
                else:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Vision API error: {error_msg}"
                    )

            # Get labels with highest confidence
            labels = response.label_annotations
            if not labels:
                raise HTTPException(
                    status_code=404,
                    detail="Tidak ada objek yang dapat diidentifikasi dalam gambar"
                )

            # Select the best label
            best_label = labels[0]

            return IdentifyResponse(
                name=best_label.description,
                confidence=best_label.score
            )

        except HTTPException as http_exc:
            # Check if this is a billing-related HTTP exception
            if hasattr(http_exc, 'detail') and self._is_vision_billing_error(str(http_exc.detail)):
                logger.warning(
                    f"Vision API HTTP billing error: {http_exc.detail}")
                raise Exception(f"BILLING_ERROR: {http_exc.detail}")
            raise http_exc
        except Exception as e:
            error_str = str(e)
            if "BILLING_ERROR" in error_str:
                raise  # Re-raise billing errors to trigger fallback
            elif self._is_vision_billing_error(error_str):
                logger.warning(
                    f"Vision API general billing error: {error_str}")
                raise Exception(f"BILLING_ERROR: {error_str}")
            raise HTTPException(
                status_code=500,
                detail=f"Terjadi kesalahan dalam layanan Vision: {error_str}"
            )

    async def _identify_with_gemini(self, file: UploadFile) -> IdentifyResponse:
        """Identify using Gemini AI as fallback."""
        try:
            # Process image for Gemini
            image = await self._process_image_for_gemini(file)

            # Initialize Gemini model
            model = genai.GenerativeModel('gemini-1.5-flash')

            # Create prompt
            prompt = self._create_identification_prompt()

            # Generate response from Gemini
            response = model.generate_content([prompt, image])

            # Parse JSON response
            result = self._parse_gemini_identification_response(response.text)

            return IdentifyResponse(
                name=result["name"],
                confidence=float(result["confidence"])
            )

        except Exception as e:
            logger.error(f"Error in Gemini identification: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Terjadi kesalahan dalam layanan Gemini: {str(e)}"
            )

    async def identify_item(self, file: UploadFile) -> IdentifyResponse:
        """Identify the main object in the image using Google Cloud Vision or Gemini fallback."""
        if not self.is_available():
            raise HTTPException(
                status_code=500,
                detail="Tidak ada layanan AI yang tersedia"
            )

        # Try Vision API first if available
        if self.vision_client is not None:
            try:
                logger.info(
                    "Attempting identification with Google Cloud Vision...")
                result = await self._identify_with_vision(file)
                logger.info(
                    f"Vision API identification successful: {result.name}")
                return result

            except Exception as e:
                if "BILLING_ERROR" in str(e) and self.gemini_api_key:
                    logger.warning(
                        "Vision API billing error detected, falling back to Gemini...")
                    # Fall through to Gemini fallback
                else:
                    raise  # Re-raise non-billing errors

        # Use Gemini as fallback
        if self.gemini_api_key:
            logger.info("Using Gemini AI for identification...")
            result = await self._identify_with_gemini(file)
            logger.info(f"Gemini identification successful: {result.name}")
            return result

        # If we reach here, no service is available
        raise HTTPException(
            status_code=500,
            detail="Semua layanan AI tidak tersedia"
        )
