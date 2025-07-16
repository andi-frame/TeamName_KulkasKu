package schema

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Recipe struct {
	BaseModel
	CreatedAt time.Time
	UpdatedAt time.Time
	UserID    uuid.UUID `gorm:"type:uuid"`
	User      User      `gorm:"foreignKey:UserID;references:ID"`
	Name      string
	LowPrice  *float64
	HighPrice *float64
	ImageURL  *string
}

func (r *Recipe) BeforeCreate(tx *gorm.DB) (err error) {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return
}
