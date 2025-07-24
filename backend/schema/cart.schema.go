package schema

import (
	"time"

	"github.com/google/uuid"
)

type Cart struct {
	BaseModel
	CreatedAt time.Time
	UpdatedAt time.Time
	UserID    uuid.UUID `gorm:"type:uuid"`
	User      User      `gorm:"foreignKey:UserID;references:ID"`
	Name      string
	Desc      *string
}

type CartItem struct {
	BaseModel
	CreatedAt  time.Time
	UpdatedAt  time.Time
	CartID     uuid.UUID `gorm:"type:uuid"`
	Cart       Cart      `gorm:"foreignKey:CartID;references:ID"`
	Name       string
	Type       string
	Amount     float64
	AmountType string
	Desc       *string
}
