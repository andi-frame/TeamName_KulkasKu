package schema

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RecipeStep struct {
	BaseModel
	RecipeID    uuid.UUID `gorm:"type:uuid"`
	Recipe      Recipe    `gorm:"foreignKey:RecipeID"`
	StepNumber  int
	Instruction string
}

func (rs *RecipeStep) BeforeCreate(tx *gorm.DB) (err error) {
	if rs.ID == uuid.Nil {
		rs.ID = uuid.New()
	}
	return
}
