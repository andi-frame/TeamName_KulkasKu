from fastapi import UploadFile

def validate_image(file: UploadFile) -> bool:
    """Validate if file is a valid image."""
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    return file.content_type in allowed_types
  
def validate_receipt_image(file: UploadFile) -> bool:
    """Validate if file is a valid image for receipt analysis."""
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/tiff", "image/bmp"]
    return file.content_type in allowed_types