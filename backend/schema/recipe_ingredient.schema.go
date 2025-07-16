package schema

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RecipeIngredient struct {
	BaseModel
	CreatedAt    time.Time
	UpdatedAt    time.Time
	RecipeID     uuid.UUID  `gorm:"type:uuid"`
	Recipe       Recipe     `gorm:"foreignKey:RecipeID;references:ID"`
	IngredientID uuid.UUID  `gorm:"type:uuid"`
	Ingredient   Ingredient `gorm:"foreignKey:IngredientID;references:ID"`
	Amount       float64
}

func (ri *RecipeIngredient) BeforeCreate(tx *gorm.DB) (err error) {
	if ri.ID == uuid.Nil {
		ri.ID = uuid.New()
	}
	return
}
