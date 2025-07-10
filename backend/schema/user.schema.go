package schema

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	BaseModel
	CreatedAt time.Time
	UpdatedAt time.Time
	Name      string
	Email     string `gorm:"unique"`
	ImageURL  string
}

// Data type from oauth google
type UserAuthType struct {
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}
