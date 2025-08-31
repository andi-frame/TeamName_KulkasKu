package schema

type PredictResponse struct {
	ItemName                string  `json:"item_name"`
	ConditionDescription    string  `json:"condition_description"`
	PredictedRemainingDays int     `json:"predicted_remaining_days"`
	Reasoning               string  `json:"reasoning"`
	Confidence              float64 `json:"confidence"`
}
