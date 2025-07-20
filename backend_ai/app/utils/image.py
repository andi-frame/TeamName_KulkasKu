from fastapi import UploadFile
import io
from PIL import Image


def validate_image(file: UploadFile) -> bool:
    """Validate if file is a valid image."""
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

    if file.content_type in allowed_types:
        return True
    try:
        content = file.file.read()
        file.file.seek(0)

        image = Image.open(io.BytesIO(content))

        supported_formats = ['JPEG', 'PNG', 'WEBP']
        if image.format in supported_formats:
            return True

        return False
    except Exception:
        return False


def validate_receipt_image(file: UploadFile) -> bool:
    """Validate if file is a valid image for receipt analysis."""
    allowed_types = ["image/jpeg", "image/jpg", "image/png",
                     "image/webp", "image/tiff", "image/bmp"]

    if file.content_type in allowed_types:
        return True

    try:
        content = file.file.read()
        file.file.seek(0)

        image = Image.open(io.BytesIO(content))

        supported_formats = ['JPEG', 'PNG', 'WEBP', 'TIFF', 'BMP']
        if image.format in supported_formats:
            return True

        return False
    except Exception:
        return False
