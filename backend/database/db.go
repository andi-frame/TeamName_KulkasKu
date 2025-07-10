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
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = DB.AutoMigrate(
		&schema.User{},
	)
	if err != nil {
		log.Fatal("Failed to migrate:", err)
	}
}
