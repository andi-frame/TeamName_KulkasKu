package schema

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// GeneratedRecipe stores the AI-generated recipes for a user
type GeneratedRecipe struct {
	BaseModel
	UserID    uuid.UUID `gorm:"type:uuid;index;unique"`
	User      User      `gorm:"foreignKey:UserID;references:ID"`
	Recipes   datatypes.JSON
	CreatedAt time.Time
	UpdatedAt time.Time
}
