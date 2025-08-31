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
	MealType          string            `json:"meal_type"` // breakfast, lunch, dinner, snack
	Description       string            `json:"description"`
	FeelingBefore     string            `json:"feeling_before"` // hungry, very_hungry, normal
	FeelingAfter      string            `json:"feeling_after"`  // full, satisfied, still_hungry
	ImageURL          string            `json:"image_url"`
	VoiceURL          string            `json:"voice_url"`
	TranscriptText    string            `json:"transcript_text"`
	AINutrition       AINutrition       `json:"ai_nutrition" gorm:"embedded;embeddedPrefix:ai_"`
	AIFeedback        string            `json:"ai_feedback"`
	AIRecommendations AIRecommendations `json:"ai_recommendations" gorm:"embedded;embeddedPrefix:rec_"`
}

type AINutrition struct {
	Calories   float64 `json:"calories"`
	Protein    float64 `json:"protein"`    // in grams
	Carbs      float64 `json:"carbs"`      // in grams
	Fat        float64 `json:"fat"`        // in grams
	Sugar      float64 `json:"sugar"`      // in grams
	Fiber      float64 `json:"fiber"`      // in grams
	Sodium     float64 `json:"sodium"`     // in mg
	Confidence float64 `json:"confidence"` // AI confidence level (0-1)
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
	ImageURL       string `json:"image_url"`
	VoiceURL       string `json:"voice_url"`
	TranscriptText string `json:"transcript_text"`
}

type FoodJournalUpdate struct {
	MealName       *string `json:"meal_name"`
	MealType       *string `json:"meal_type"`
	Description    *string `json:"description"`
	FeelingBefore  *string `json:"feeling_before"`
	FeelingAfter   *string `json:"feeling_after"`
	ImageURL       *string `json:"image_url"`
	VoiceURL       *string `json:"voice_url"`
	TranscriptText *string `json:"transcript_text"`
}

type FoodJournalResponse struct {
	ID                uuid.UUID         `json:"id"`
	CreatedAt         time.Time         `json:"created_at"`
	MealName          string            `json:"meal_name"`
	MealType          string            `json:"meal_type"`
	Description       string            `json:"description"`
	FeelingBefore     string            `json:"feeling_before"`
	FeelingAfter      string            `json:"feeling_after"`
	ImageURL          string            `json:"image_url"`
	VoiceURL          string            `json:"voice_url"`
	TranscriptText    string            `json:"transcript_text"`
	AINutrition       AINutrition       `json:"ai_nutrition"`
	AIFeedback        string            `json:"ai_feedback"`
	AIRecommendations AIRecommendations `json:"ai_recommendations"`
}

func (fj *FoodJournal) BeforeCreate(tx *gorm.DB) (err error) {
	if fj.ID == uuid.Nil {
		fj.ID = uuid.New()
	}
	return
}
