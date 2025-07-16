import asyncio
import base64
import io
import json
import logging
import os
from typing import Dict, Any, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from google.cloud import vision
from PIL import Image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(
    title="Fridge Tracker AI Service",
    description="Layanan mikro khusus untuk analisis gambar makanan menggunakan Google Cloud Vision dan Gemini AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    vision_client = vision.ImageAnnotatorClient()
    logger.info("Google Cloud Vision client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Vision client: {e}")
    vision_client = None

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        logger.info("Gemini API configured successfully")
    except Exception as e:
        logger.error(f"Failed to configure Gemini: {e}")
else:
    logger.warning("GEMINI_API_KEY not found in environment variables")

# =================================================================
# Pydantic Models
# =================================================================

class IdentifyResponse(BaseModel):
    """Model respons untuk identifikasi nama saja."""
    name: str
    confidence: float

class PredictResponse(BaseModel):
    """Model respons untuk analisis mendalam."""
    item_name: str
    condition_description: str
    predicted_remaining_days: int
    confidence: float

class ErrorResponse(BaseModel):
    """Model respons untuk error."""
    error: str
    detail: str

# =================================================================
# Helper Functions
# =================================================================

def validate_image(file: UploadFile) -> bool:
    """Validasi apakah file adalah gambar yang valid."""
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    return file.content_type in allowed_types

async def process_image_for_vision(file: UploadFile) -> vision.Image:
    """Memproses file upload untuk Google Cloud Vision."""
    content = await file.read()
    image = vision.Image(content=content)
    return image

async def process_image_for_gemini(file: UploadFile) -> Image.Image:
    """Memproses file upload untuk Gemini."""
    content = await file.read()
    image = Image.open(io.BytesIO(content))
    return image

def create_gemini_prompt() -> str:
    """Membuat prompt yang detail untuk Gemini."""
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

# =================================================================
# API Endpoints
# =================================================================

@app.get("/")
async def health_check():
    """Endpoint untuk memeriksa status layanan."""
    return {
        "status": "AI Service is running healthy",
        "services": {
            "vision_api": vision_client is not None,
            "gemini_api": GEMINI_API_KEY is not None
        }
    }

@app.post("/identify-item", response_model=IdentifyResponse)
async def identify_item_only(file: UploadFile = File(...)):
    """
    Mengidentifikasi nama objek utama dalam gambar menggunakan Google Cloud Vision.
    """
    logger.info(f"Menerima permintaan identifikasi untuk file: {file.filename}")
    
    # Validasi file
    if not validate_image(file):
        raise HTTPException(
            status_code=400,
            detail="File harus berupa gambar (JPEG, PNG, atau WebP)"
        )
    
    # Cek apakah Vision client tersedia
    if vision_client is None:
        raise HTTPException(
            status_code=500,
            detail="Google Cloud Vision API tidak tersedia"
        )
    
    try:
        # Proses gambar untuk Vision API
        image = await process_image_for_vision(file)
        
        # Panggil Vision API untuk label detection
        response = vision_client.label_detection(image=image)
        
        if response.error.message:
            raise HTTPException(
                status_code=500,
                detail=f"Vision API error: {response.error.message}"
            )
        
        # Ambil label dengan confidence tertinggi
        labels = response.label_annotations
        if not labels:
            raise HTTPException(
                status_code=404,
                detail="Tidak ada objek yang dapat diidentifikasi dalam gambar"
            )
        
        # Pilih label terbaik
        best_label = labels[0]
        
        logger.info(f"Identifikasi berhasil: {best_label.description} (confidence: {best_label.score})")
        
        return IdentifyResponse(
            name=best_label.description,
            confidence=best_label.score
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error dalam identifikasi: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Terjadi kesalahan internal: {str(e)}"
        )

@app.post("/predict-item", response_model=PredictResponse)
async def predict_item_with_reasoning(file: UploadFile = File(...)):
    """
    Menganalisis gambar makanan secara mendalam menggunakan Gemini AI.
    """
    logger.info(f"Menerima permintaan prediksi untuk file: {file.filename}")
    
    # Validasi file
    if not validate_image(file):
        raise HTTPException(
            status_code=400,
            detail="File harus berupa gambar (JPEG, PNG, atau WebP)"
        )
    
    # Cek apakah Gemini API tersedia
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API tidak tersedia"
        )
    
    try:
        # Proses gambar untuk Gemini
        image = await process_image_for_gemini(file)
        
        # Inisialisasi model Gemini
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Buat prompt
        prompt = create_gemini_prompt()
        
        # Generate respons dari Gemini
        response = model.generate_content([prompt, image])
        
        # Parse respons JSON
        try:
            # Ekstrak JSON dari respons
            response_text = response.text
            
            # Coba parse JSON
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()
            
            result = json.loads(response_text)
            
            # Validasi struktur respons
            required_fields = ["item_name", "condition_description", "predicted_remaining_days", "confidence"]
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Field '{field}' tidak ditemukan dalam respons")
            
            logger.info(f"Prediksi berhasil: {result['item_name']} - {result['predicted_remaining_days']} hari")
            
            return PredictResponse(
                item_name=result["item_name"],
                condition_description=result["condition_description"],
                predicted_remaining_days=int(result["predicted_remaining_days"]),
                confidence=float(result["confidence"])
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON dari Gemini: {e}")
            logger.error(f"Raw response: {response.text}")
            raise HTTPException(
                status_code=500,
                detail="Respons dari AI tidak dalam format yang valid"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error dalam prediksi: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Terjadi kesalahan internal: {str(e)}"
        )

# =================================================================
# Error Handlers
# =================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handler untuk HTTP exceptions."""
    return {
        "error": "HTTP Error",
        "detail": exc.detail,
        "status_code": exc.status_code
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handler untuk exceptions umum."""
    logger.error(f"Unhandled exception: {exc}")
    return {
        "error": "Internal Server Error",
        "detail": "Terjadi kesalahan yang tidak terduga",
        "status_code": 500
    }
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8001)