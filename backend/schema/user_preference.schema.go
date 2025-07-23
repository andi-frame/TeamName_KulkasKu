package schema

import (
	"time"

	"github.com/google/uuid"
)

// UserPreference tracks user's cooking preferences learned from behavior
type UserPreference struct {
	BaseModel
	CreatedAt time.Time
	UpdatedAt time.Time
	UserID    uuid.UUID `gorm:"type:uuid;index"`
	User      User      `gorm:"foreignKey:UserID;references:ID"`

	// Recipe preferences (learned from interactions)
	PreferredTags       []string `gorm:"type:text[]"`        // Most clicked recipe tags
	AvgCookingTime      int      `gorm:"default:30"`         // Preferred cooking duration
	AvgCalories         float64  `gorm:"default:400"`        // Preferred calorie range
	PreferredCategories []string `gorm:"type:text[]"`        // Preferred food categories
	PriceRange          string   `gorm:"default:affordable"` // budget, affordable, premium
	ServingPreference   int      `gorm:"default:2"`          // Preferred serving size

	// Ingredient preferences (top ingredients user often uses)
	PreferredIngredients []string `gorm:"type:text[]"`
	DislikedIngredients  []string `gorm:"type:text[]"`

	LastUpdated time.Time
}

// UserActivity tracks all user interactions with recipes
type UserActivity struct {
	BaseModel
	CreatedAt time.Time
	UserID    uuid.UUID `gorm:"type:uuid;index"`
	User      User      `gorm:"foreignKey:UserID;references:ID"`

	RecipeID     string `gorm:"index"` // Recipe ID from API
	RecipeTitle  string
	RecipeSlug   string
	ActivityType string `gorm:"index"` // "view", "detail_view", "cooked", "bookmarked"

	// Interaction metrics
	ViewDuration int `gorm:"default:0"` // Seconds spent viewing

	// Recipe data snapshot (for learning)
	RecipeTags     []string `gorm:"type:text[]"`
	RecipeCategory string
	CookingTime    int
	Calories       string
	Price          int
	ServingSize    int

	SessionID string `gorm:"index"` // For grouping activities
}
