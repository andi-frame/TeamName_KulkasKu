package schema

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FoodJournal struct {
	BaseModel
	CreatedAt         time.Time         `json:"created_at"`
	UpdatedAt         time.Time         `json:"updated_at"`
	UserID            uuid.UUID         `json:"user_id" gorm:"not null"`
	User              User              `json:"user" gorm:"foreignKey:UserID"`
	MealName          string            `json:"meal_name" gorm:"not null"`
	MealType          string            `json:"meal_type"`
	Description       string            `json:"description"`
	FeelingBefore     string            `json:"feeling_before"`
	FeelingAfter      string            `json:"feeling_after"`
	InputType         string            `json:"input_type"`
	RawInput          string            `json:"raw_input"`
	ProcessedInput    string            `json:"processed_input"`
	ImageURL          string            `json:"image_url"`
	AINutrition       AINutrition       `json:"ai_nutrition" gorm:"embedded;embeddedPrefix:ai_"`
	AIFeedback        string            `json:"ai_feedback"`
	AIRecommendations AIRecommendations `json:"ai_recommendations" gorm:"embedded;embeddedPrefix:rec_"`
	FoodAnalysis      string            `json:"food_analysis" gorm:"type:jsonb"`
}

type AINutrition struct {
	Calories   float64 `json:"calories"`
	Protein    float64 `json:"protein"`
	Carbs      float64 `json:"carbs"`
	Fat        float64 `json:"fat"`
	Sugar      float64 `json:"sugar"`
	Fiber      float64 `json:"fiber"`
	Sodium     float64 `json:"sodium"`
	Confidence float64 `json:"confidence"`
}

type FoodAnalysis struct {
	DetectedFoods  []DetectedFood `json:"detected_foods"`
	TotalNutrition AINutrition    `json:"total_nutrition"`
	AnalysisText   string         `json:"analysis_text"`
	Confidence     float64        `json:"confidence"`
}

type DetectedFood struct {
	Name        string      `json:"name"`
	Portion     string      `json:"portion"`
	Weight      float64     `json:"weight"`
	Nutrition   AINutrition `json:"nutrition"`
	Description string      `json:"description"`
}

type AIRecommendations struct {
	NextMealSuggestion  string `json:"next_meal_suggestion"`
	NutritionTips       string `json:"nutrition_tips"`
	MotivationalMessage string `json:"motivational_message"`
}

type FoodJournalCreate struct {
	MealName       string `json:"meal_name" binding:"required"`
	MealType       string `json:"meal_type"`
	Description    string `json:"description"`
	FeelingBefore  string `json:"feeling_before"`
	FeelingAfter   string `json:"feeling_after"`
	InputType      string `json:"input_type"`
	RawInput       string `json:"raw_input"`
	ProcessedInput string `json:"processed_input"`
	ImageURL       string `json:"image_url"`
}

type FoodJournalUpdate struct {
	MealName      *string `json:"meal_name"`
	MealType      *string `json:"meal_type"`
	Description   *string `json:"description"`
	FeelingBefore *string `json:"feeling_before"`
	FeelingAfter  *string `json:"feeling_after"`
	ImageURL      *string `json:"image_url"`
}

type FoodJournalResponse struct {
	ID                uuid.UUID         `json:"id"`
	CreatedAt         time.Time         `json:"created_at"`
	MealName          string            `json:"meal_name"`
	MealType          string            `json:"meal_type"`
	Description       string            `json:"description"`
	FeelingBefore     string            `json:"feeling_before"`
	FeelingAfter      string            `json:"feeling_after"`
	InputType         string            `json:"input_type"`
	RawInput          string            `json:"raw_input"`
	ProcessedInput    string            `json:"processed_input"`
	ImageURL          string            `json:"image_url"`
	AINutrition       AINutrition       `json:"ai_nutrition"`
	AIFeedback        string            `json:"ai_feedback"`
	AIRecommendations AIRecommendations `json:"ai_recommendations"`
	FoodAnalysis      *FoodAnalysis     `json:"food_analysis"`
}

func (fj *FoodJournal) BeforeCreate(tx *gorm.DB) (err error) {
	if fj.ID == uuid.Nil {
		fj.ID = uuid.New()
	}
	return
}
