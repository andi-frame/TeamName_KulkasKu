from pydantic import BaseModel
from typing import List

class IdentifyResponse(BaseModel):
    """Model respons untuk identifikasi nama saja."""
    name: str
    confidence: float

class PredictResponse(BaseModel):
    """Model respons untuk analisis mendalam."""
    item_name: str
    condition_description: str
    predicted_remaining_days: int
    reasoning: str
    confidence: float

class ReceiptItem(BaseModel):
    """Model untuk item dalam struk."""
    name: str
    quantity: int
    price: float
    confidence: float

class ReceiptAnalysisResponse(BaseModel):
    """Model respons untuk analisis struk."""
    success: bool
    data: dict = None
    error: str = None

class ErrorResponse(BaseModel):
    """Model respons untuk error."""
    error: str
    detail: str