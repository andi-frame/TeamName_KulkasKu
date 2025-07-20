package schema

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Item struct {
	BaseModel
	CreatedAt  time.Time
	UpdatedAt  time.Time
	UserID     uuid.UUID `gorm:"type:uuid"`
	User       User      `gorm:"foreignKey:UserID;references:ID"`
	Name       string
	Type       string
	Amount     float64
	AmountType *string
	Desc       *string
	ExpDate    time.Time
}

func (i *Item) BeforeCreate(tx *gorm.DB) (err error) {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return
}
