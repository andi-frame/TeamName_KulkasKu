package schema

// RecipeActivityRequest defines the structure for the request body
type RecipeActivityRequest struct {
	RecipeDetail
	ActivityType string `json:"activityType"`
	ViewDuration int    `json:"viewDuration"`
}
