package database

import (
	"log"
	"os"

	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() {
	dsn := os.Getenv("DATABASE_URL")
	var err error
	DB, err = gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err := DB.AutoMigrate(
		&schema.User{},
		&schema.Item{},
		&schema.UserActivity{},
		&schema.UserPreference{},
		&schema.UserPreferenceTag{},
		&schema.UserPreferenceCategory{},
		&schema.UserPreferenceIngredient{},
		&schema.UserDislikedIngredient{},
		&schema.UserActivityRecipeTag{},
		&schema.Cart{},
		&schema.CartItem{},
	); err != nil {
		log.Println("AutoMigrate warning:", err)
	}
}
