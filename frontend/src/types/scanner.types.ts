export type ScannerType = "barcode" | "image" | "receipt";

export interface BarcodeResult {
  name: string;
  barcode: string;
}

export interface ImagePredictionResult {
  item_name: string;
  predicted_remaining_days: number;
  reasoning: string;
  condition_description?: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  confidence: number;
}

export interface ReceiptResult {
  items: ReceiptItem[];
  total_items: number;
  confidence: number;
  processing_time?: string;
}

export interface FoodScannerProps {
  onBarcodeResult?: (result: BarcodeResult) => void;
  onImageResult?: (result: ImagePredictionResult) => void;
  onReceiptResult?: (result: ReceiptResult) => void;
  onClose?: () => void;
}

export interface ScannerSelectionProps {
  onSelect: (type: ScannerType) => void;
  onClose: () => void;
}

export interface AIResultModalProps {
  isOpen: boolean;
  result: ImagePredictionResult | null;
  onAccept: () => void;
  onCancel: () => void;
}
