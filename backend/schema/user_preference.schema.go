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

	// Recipe preferences
	AvgCookingTime    int     `gorm:"default:30"`
	AvgCalories       float64 `gorm:"default:400"`
	PriceRange        string  `gorm:"default:affordable"`
	ServingPreference int     `gorm:"default:2"`
	LastUpdated       time.Time

	// Relationships for array fields
	PreferredTags        []UserPreferenceTag
	PreferredCategories  []UserPreferenceCategory
	PreferredIngredients []UserPreferenceIngredient
	DislikedIngredients  []UserDislikedIngredient
}

// UserPreferenceTag for preferred tags
type UserPreferenceTag struct {
	BaseModel
	UserPreferenceID uuid.UUID `gorm:"type:uuid;index"`
	Tag              string    `gorm:"index;size:100"`
}

// UserPreferenceCategory for preferred categories
type UserPreferenceCategory struct {
	BaseModel
	UserPreferenceID uuid.UUID `gorm:"type:uuid;index"`
	Category         string    `gorm:"index;size:100"`
}

// UserPreferenceIngredient for preferred ingredients
type UserPreferenceIngredient struct {
	BaseModel
	UserPreferenceID uuid.UUID `gorm:"type:uuid;index"`
	Ingredient       string    `gorm:"index;size:100"`
}

// UserDislikedIngredient for disliked ingredients
type UserDislikedIngredient struct {
	BaseModel
	UserPreferenceID uuid.UUID `gorm:"type:uuid;index"`
	Ingredient       string    `gorm:"index;size:100"`
}

// UserActivity tracks all user interactions with recipes
type UserActivity struct {
	BaseModel
	CreatedAt time.Time
	UserID    uuid.UUID `gorm:"type:uuid;index"`
	User      User      `gorm:"foreignKey:UserID;references:ID"`

	RecipeID     string `gorm:"index"`
	RecipeTitle  string
	RecipeSlug   string
	ActivityType string `gorm:"index"`
	ViewDuration int    `gorm:"default:0"`

	// Recipe snapshot fields
	RecipeCategory string
	CookingTime    int
	Calories       string
	Price          int
	ServingSize    int
	SessionID      string `gorm:"index"`

	// Relationship for tags
	RecipeTags []UserActivityRecipeTag
}

// UserActivityRecipeTag for activity tags
type UserActivityRecipeTag struct {
	BaseModel
	UserActivityID uuid.UUID `gorm:"type:uuid;index"`
	Tag            string    `gorm:"index;size:100"`
}
