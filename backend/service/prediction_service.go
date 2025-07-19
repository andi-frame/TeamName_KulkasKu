package service

type AIResult struct {
	ItemName   string `json:"item_name"`
	Condition  string `json:"condition"`
	ExpiryDays int    `json:"expiry_days"`
	Reasoning  string `json:"reasoning,omitempty"`
}

type AIPredictionService interface {
	PredictItem(imageData []byte) (*AIResult, error)
}
