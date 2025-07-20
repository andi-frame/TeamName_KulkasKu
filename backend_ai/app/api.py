import logging
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .models import IdentifyResponse, PredictResponse, ReceiptAnalysisResponse
from .services.cloud_vision import VisionService
from .services.gemini import GeminiService
from .services.receipt import ReceiptService
from .utils.image import validate_image, validate_receipt_image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Fridge Tracker AI Service",
    description="Layanan mikro khusus untuk analisis gambar makanan dan receipt scanning menggunakan Google Cloud Vision dan Gemini AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
cloud_vision = VisionService()
gemini = GeminiService()
receipt_service = ReceiptService()

# =================================================================
# API Endpoints
# =================================================================


@app.get("/")
async def health_check():
    """Endpoint untuk memeriksa status layanan."""
    return {
        "status": "AI Service is running healthy",
        "services": {
            "vision_api": cloud_vision.is_available(),
            "gemini_api": gemini.is_available(),
            "receipt_analysis": receipt_service.is_available()
        }
    }


@app.post("/identify-item", response_model=IdentifyResponse)
async def identify_item_only(file: UploadFile = File(...)):
    """
    Mengidentifikasi nama objek utama dalam gambar menggunakan Google Cloud Vision.
    """
    logger.info(
        f"Menerima permintaan identifikasi untuk file: {file.filename}")

    # Validasi file
    if not validate_image(file):
        raise HTTPException(
            status_code=400,
            detail="File harus berupa gambar (JPEG, PNG, atau WebP)"
        )

    try:
        result = await cloud_vision.identify_item(file)
        logger.info(
            f"Identifikasi berhasil: {result.name} (confidence: {result.confidence})")
        return result

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

    try:
        result = await gemini.predict_item(file)
        logger.info(
            f"Prediksi berhasil: {result.item_name} - {result.predicted_remaining_days} hari - {result.condition_description}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error dalam prediksi: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Terjadi kesalahan internal: {str(e)}"
        )


@app.post("/analyze-receipt", response_model=ReceiptAnalysisResponse)
async def analyze_receipt_scan(file: UploadFile = File(...)):
    """
    Menganalisis struk belanja dan mengekstrak item-item yang dibeli.
    """
    logger.info(
        f"Menerima permintaan analisis struk untuk file: {file.filename}")

    # Validasi file
    if not validate_receipt_image(file):
        raise HTTPException(
            status_code=400,
            detail="File harus berupa gambar (JPEG, PNG, WebP, TIFF, atau BMP)"
        )

    try:
        result = await receipt_service.analyze_receipt(file)

        if result.success:
            logger.info(
                f"Analisis struk berhasil: {len(result.data.get('items', []))} item ditemukan")
        else:
            logger.warning(f"Analisis struk gagal: {result.error}")

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error dalam analisis struk: {e}")
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
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "detail": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handler untuk exceptions umum."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": "Terjadi kesalahan yang tidak terduga",
            "status_code": 500
        }
    )
