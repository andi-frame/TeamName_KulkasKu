package schema

type ReceiptItem struct {
	Name       string  `json:"name"`
	Quantity   int     `json:"quantity"`
	Price      float64 `json:"price"`
	Confidence float64 `json:"confidence"`
}

type ReceiptAnalysisResponse struct {
	Success bool         `json:"success"`
	Data    *ReceiptData `json:"data,omitempty"`
	Error   string       `json:"error,omitempty"`
}

type ReceiptData struct {
	Items          []ReceiptItem `json:"items"`
	Confidence     float64       `json:"confidence"`
	ProcessingTime string        `json:"processing_time,omitempty"`
}
