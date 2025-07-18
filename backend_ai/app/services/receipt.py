import re
import time
import logging
import json
import io
import os
from typing import List, Optional
from fastapi import HTTPException, UploadFile
from google.cloud import vision
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv

from ..models import ReceiptItem, ReceiptAnalysisResponse

load_dotenv()
logger = logging.getLogger(__name__)


class ReceiptItemInternal:
    """Internal class for receipt item processing."""

    def __init__(self, name: str, quantity: int = 1, price: float = 0.0, confidence: float = 0.0):
        self.name = name
        self.quantity = quantity
        self.price = price
        self.confidence = confidence


class ReceiptService:
    def __init__(self):
        self.vision_client = self._initialize_vision_client()
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self._configure_gemini()

        # Keywords to ignore
        self.ignore_keywords = [
            'total', 'tunai', 'kembali', 'kembalian', 'ppn', 'pajak', 'diskon',
            'terima kasih', 'thank you', 'welcome', 'selamat datang',
            'kasir', 'cashier', 'no', 'receipt', 'struk', 'bon',
            'alamat', 'telp', 'phone', 'jalan', 'street', 'kota',
            'npwp', 'subtotal', 'qty', 'harga', 'jumlah'
        ]

        # Patterns for detecting item lines
        self.item_patterns = [
            r'^[A-Z\s]+\d+\s*\d+[\.,]\d+$',  # Format: NAMA ITEM QTY HARGA
            r'^[A-Z\s]+\d+[\.,]\d+$',        # Format: NAMA ITEM HARGA
            r'^[A-Z\s]+\s+\d+[\.,]\d+$',     # Format: NAMA ITEM   HARGA
        ]

        # Pattern for detecting prices
        self.price_pattern = r'\d+[\.,]\d{3}(?:[\.,]\d{2})?'

        # Pattern for detecting quantity
        self.qty_pattern = r'\b\d+\s*x\b|\b\d+\s*pcs\b|\b\d+\s*pc\b'

    def _initialize_vision_client(self) -> Optional[vision.ImageAnnotatorClient]:
        """Initialize Google Cloud Vision client."""
        try:
            client = vision.ImageAnnotatorClient()
            logger.info(
                "Google Cloud Vision client for receipt analysis initialized successfully")
            return client
        except Exception as e:
            logger.error(
                f"Failed to initialize Vision client for receipt analysis: {e}")
            return None

    def _configure_gemini(self):
        """Configure Gemini API as fallback."""
        if self.gemini_api_key:
            try:
                genai.configure(api_key=self.gemini_api_key)
                logger.info(
                    "Gemini API configured as fallback for receipt analysis")
            except Exception as e:
                logger.error(f"Failed to configure Gemini fallback: {e}")
        else:
            logger.warning(
                "GEMINI_API_KEY not found - no fallback available for receipt analysis")

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

    def _create_receipt_analysis_prompt(self) -> str:
        """Create prompt for Gemini to analyze receipt."""
        return """
        Analisis struk belanja dalam gambar ini dan ekstrak semua item yang dibeli. 
        Berikan respons dalam format JSON dengan struktur berikut:

        {
            "items": [
                {
                    "name": "nama item",
                    "quantity": jumlah (integer),
                    "price": harga satuan (float),
                    "confidence": nilai kepercayaan 0-1 (float)
                }
            ],
            "confidence": nilai kepercayaan keseluruhan 0-1 (float)
        }

        Petunjuk analisis:
        - Fokus pada item-item yang dibeli (produk/barang)
        - Abaikan informasi toko, tanggal, waktu, total, pajak, dan kembalian
        - Ekstrak nama item, jumlah, dan harga jika tersedia
        - Berikan confidence score berdasarkan kejelasan teks
        - Gunakan bahasa Indonesia untuk nama item
        - Hindari duplikasi item yang sama
        - Jika tidak ada quantity yang terdeteksi, gunakan 1 sebagai default
        - Jika tidak ada harga yang terdeteksi, gunakan 0.0 sebagai default
        """

    def _parse_gemini_receipt_response(self, response_text: str) -> dict:
        """Parse JSON response from Gemini for receipt analysis."""
        try:
            # Clean up response text
            if response_text.startswith("```json"):
                response_text = response_text.replace(
                    "```json", "").replace("```", "").strip()

            result = json.loads(response_text)

            # Validate response structure
            if "items" not in result:
                raise ValueError("Response tidak memiliki struktur yang benar")

            # Ensure items is a list
            if not isinstance(result["items"], list):
                raise ValueError("Items harus berupa list")

            # Set default confidence if not provided
            if "confidence" not in result:
                result["confidence"] = 0.7

            return result

        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON dari Gemini: {e}")
            logger.error(f"Raw response: {response_text}")
            # Return fallback response
            return {
                "items": [],
                "confidence": 0.0
            }

    def _extract_text_from_image_vision(self, image_data: bytes) -> str:
        """Extract text from image using Google Cloud Vision API."""
        try:
            image = vision.Image(content=image_data)
            response = self.vision_client.document_text_detection(image=image)

            if response.error.message:
                error_msg = response.error.message
                logger.error(f"Vision API error: {error_msg}")
                if self._is_vision_billing_error(error_msg):
                    logger.warning(
                        f"Vision API billing/quota error detected: {error_msg}")
                    raise Exception(f"BILLING_ERROR: {error_msg}")
                else:
                    raise Exception(f'Vision API Error: {error_msg}')

            return response.full_text_annotation.text if response.full_text_annotation else ""

        except Exception as e:
            error_str = str(e)
            if "BILLING_ERROR" in error_str:
                raise  
            elif self._is_vision_billing_error(error_str):
                logger.warning(
                    f"Vision API general billing error: {error_str}")
                raise Exception(f"BILLING_ERROR: {error_str}")
            raise Exception(f"OCR Error: {error_str}")

    async def _analyze_receipt_with_vision(self, file: UploadFile) -> ReceiptAnalysisResponse:
        """Analyze receipt using Google Cloud Vision API."""
        try:
            # Read image data
            image_data = await file.read()

            # Extract text using OCR
            extracted_text = self._extract_text_from_image_vision(image_data)

            if not extracted_text:
                return ReceiptAnalysisResponse(
                    success=False,
                    error="Tidak dapat membaca teks dari gambar"
                )

            # Parse text to get items
            items = self._parse_receipt_text(extracted_text)

            # Calculate overall confidence
            if items:
                overall_confidence = sum(
                    item.confidence for item in items) / len(items)
            else:
                overall_confidence = 0.0

            # Format response items
            response_items = []
            for item in items:
                response_items.append({
                    "name": item.name,
                    "quantity": item.quantity,
                    "price": item.price,
                    "confidence": item.confidence
                })

            return ReceiptAnalysisResponse(
                success=True,
                data={
                    "items": response_items,
                    "confidence": overall_confidence
                }
            )

        except Exception as e:
            error_str = str(e)
            if "BILLING_ERROR" in error_str:
                raise  # Re-raise billing errors to trigger fallback
            elif self._is_vision_billing_error(error_str):
                logger.warning(f"Vision API billing error: {error_str}")
                raise Exception(f"BILLING_ERROR: {error_str}")
            raise Exception(
                f"Terjadi kesalahan dalam layanan Vision: {error_str}")

    async def _analyze_receipt_with_gemini(self, file: UploadFile) -> ReceiptAnalysisResponse:
        """Analyze receipt using Gemini AI as fallback."""
        try:
            # Process image for Gemini
            image = await self._process_image_for_gemini(file)

            # Initialize Gemini model
            model = genai.GenerativeModel('gemini-1.5-flash')

            # Create prompt
            prompt = self._create_receipt_analysis_prompt()

            # Generate response from Gemini
            response = model.generate_content([prompt, image])

            # Parse JSON response
            result = self._parse_gemini_receipt_response(response.text)

            return ReceiptAnalysisResponse(
                success=True,
                data={
                    "items": result["items"],
                    "confidence": float(result["confidence"])
                }
            )

        except Exception as e:
            logger.error(f"Error in Gemini receipt analysis: {e}")
            return ReceiptAnalysisResponse(
                success=False,
                error=f"Terjadi kesalahan dalam layanan Gemini: {str(e)}"
            )

    def _clean_text(self, text: str) -> List[str]:
        """Clean and split text by lines."""
        lines = text.split('\n')
        cleaned_lines = []

        for line in lines:
            # Clean whitespace
            line = line.strip()

            # Skip empty lines
            if not line:
                continue

            # Skip lines that are too short (likely noise)
            if len(line) < 3:
                continue

            # Convert to uppercase for consistency
            line = line.upper()

            cleaned_lines.append(line)

        return cleaned_lines

    def _is_ignored_line(self, line: str) -> bool:
        """Check if line should be ignored."""
        line_lower = line.lower()

        for keyword in self.ignore_keywords:
            if keyword in line_lower:
                return True

        # Skip lines that only contain numbers/prices
        if re.match(r'^\d+[\.,]\d+$', line):
            return True

        # Skip lines containing dates
        if re.search(r'\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}', line):
            return True

        # Skip lines containing time
        if re.search(r'\d{1,2}:\d{2}', line):
            return True

        return False

    def _extract_item_info(self, line: str) -> Optional[ReceiptItemInternal]:
        """Extract item information from line."""
        if self._is_ignored_line(line):
            return None

        # Find prices in line
        prices = re.findall(self.price_pattern, line)
        price = 0.0

        if prices:
            # Take the last price (usually the total price)
            price_str = prices[-1].replace('.', '').replace(',', '.')
            try:
                price = float(price_str)
            except ValueError:
                price = 0.0

        # Find quantity
        qty_matches = re.findall(self.qty_pattern, line.lower())
        quantity = 1

        if qty_matches:
            qty_str = re.findall(r'\d+', qty_matches[0])[0]
            try:
                quantity = int(qty_str)
            except ValueError:
                quantity = 1

        # Extract item name (remove price and quantity)
        item_name = line

        # Remove price from name
        for price_match in prices:
            item_name = item_name.replace(price_match, '')

        # Remove quantity from name
        for qty_match in qty_matches:
            item_name = item_name.replace(qty_match.upper(), '')

        # Clean item name
        item_name = re.sub(r'\s+', ' ', item_name).strip()
        # Remove numbers at the beginning
        item_name = re.sub(r'^\d+\s*', '', item_name)

        # Skip if name is too short
        if len(item_name) < 3:
            return None

        # Calculate confidence based on several factors
        confidence = self._calculate_confidence(
            line, item_name, price, quantity)

        return ReceiptItemInternal(
            name=item_name,
            quantity=quantity,
            price=price,
            confidence=confidence
        )

    def _calculate_confidence(self, original_line: str, item_name: str, price: float, quantity: int) -> float:
        """Calculate confidence score for item."""
        confidence = 0.5  # Base confidence

        # Boost confidence if there's a price
        if price > 0:
            confidence += 0.3

        # Boost confidence if there's quantity
        if quantity > 1:
            confidence += 0.1

        # Boost confidence if item name makes sense (contains letters)
        if re.search(r'[A-Z]{3,}', item_name):
            confidence += 0.2

        # Penalize if line contains suspicious words
        suspicious_words = ['struk', 'bon', 'kasir', 'total']
        for word in suspicious_words:
            if word in original_line.lower():
                confidence -= 0.2

        return min(max(confidence, 0.0), 1.0)

    def _parse_receipt_text(self, text: str) -> List[ReceiptItemInternal]:
        """Parse receipt text and extract items."""
        lines = self._clean_text(text)
        items = []

        for line in lines:
            item = self._extract_item_info(line)
            if item and item.confidence > 0.3:  # Only take items with confidence > 30%
                items.append(item)

        # Deduplicate items with similar names
        items = self._deduplicate_items(items)

        return items

    def _deduplicate_items(self, items: List[ReceiptItemInternal]) -> List[ReceiptItemInternal]:
        """Remove duplicate items with similar names."""
        unique_items = []

        for item in items:
            is_duplicate = False

            for existing_item in unique_items:
                # Calculate similarity
                similarity = self._calculate_similarity(
                    item.name, existing_item.name)

                if similarity > 0.8:  # Threshold for duplication
                    is_duplicate = True
                    # Take item with higher confidence
                    if item.confidence > existing_item.confidence:
                        unique_items.remove(existing_item)
                        unique_items.append(item)
                    break

            if not is_duplicate:
                unique_items.append(item)

        return unique_items

    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """Calculate similarity between two strings."""
        # Simple similarity based on common words
        words1 = set(str1.split())
        words2 = set(str2.split())

        if not words1 or not words2:
            return 0.0

        intersection = words1.intersection(words2)
        union = words1.union(words2)

        return len(intersection) / len(union)

    async def analyze_receipt(self, file: UploadFile) -> ReceiptAnalysisResponse:
        """Analyze receipt image and extract items."""
        start_time = time.time()

        if not self.is_available():
            return ReceiptAnalysisResponse(
                success=False,
                error="Tidak ada layanan AI yang tersedia"
            )

        try:
            # Validate file
            if not file.content_type.startswith('image/'):
                return ReceiptAnalysisResponse(
                    success=False,
                    error="File harus berupa gambar"
                )

            # Try Vision API first if available
            if self.vision_client is not None:
                try:
                    logger.info(
                        "Attempting receipt analysis with Google Cloud Vision...")
                    result = await self._analyze_receipt_with_vision(file)

                    if result.success:
                        # Calculate processing time
                        processing_time = f"{time.time() - start_time:.2f}s"
                        result.data["processing_time"] = processing_time
                        logger.info(
                            f"Vision API receipt analysis successful: {len(result.data.get('items', []))} items found")
                        return result
                    else:
                        # If Vision failed for non-billing reasons, try Gemini
                        if self.gemini_api_key:
                            logger.info(
                                "Vision API failed, trying Gemini fallback...")
                        else:
                            return result

                except Exception as e:
                    if "BILLING_ERROR" in str(e) and self.gemini_api_key:
                        logger.warning(
                            "Vision API billing error detected, falling back to Gemini...")
                        # Fall through to Gemini fallback
                    else:
                        # For non-billing errors, return the error
                        return ReceiptAnalysisResponse(
                            success=False,
                            error=str(e)
                        )

            # Use Gemini as fallback
            if self.gemini_api_key:
                logger.info("Using Gemini AI for receipt analysis...")
                result = await self._analyze_receipt_with_gemini(file)

                if result.success:
                    # Calculate processing time
                    processing_time = f"{time.time() - start_time:.2f}s"
                    result.data["processing_time"] = processing_time
                    logger.info(
                        f"Gemini receipt analysis successful: {len(result.data.get('items', []))} items found")

                return result

            # If we reach here, no service is available
            return ReceiptAnalysisResponse(
                success=False,
                error="Semua layanan AI tidak tersedia"
            )

        except Exception as e:
            logger.error(f"Error in receipt analysis: {e}")
            return ReceiptAnalysisResponse(
                success=False,
                error=str(e)
            )
