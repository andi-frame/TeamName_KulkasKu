package schema

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Ingredient struct {
	BaseModel
	CreatedAt time.Time
	UpdatedAt time.Time
	Name      string
	Type      string
	LowPrice  float64
	HighPrice float64
}

func (i *Ingredient) BeforeCreate(tx *gorm.DB) (err error) {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return
}
