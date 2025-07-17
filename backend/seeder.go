package main

import (
	"log"
	"math/rand"
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/database"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	database.Init()

	// Create users
	users := []schema.User{
		{
			BaseModel: schema.BaseModel{ID: uuid.New()},
			Name:      "Andi Farhan",
			Email:     "andi@example.com",
			ImageURL:  "https://example.com/image1.jpg",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			BaseModel: schema.BaseModel{ID: uuid.New()},
			Name:      "Budi Santoso",
			Email:     "budi@example.com",
			ImageURL:  "https://example.com/image2.jpg",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	// Insert users
	for _, user := range users {
		err := database.DB.Create(&user).Error
		if err != nil {
			log.Fatalf("Failed to create user: %v", err)
		}
	}

	// List of random item names and types
	itemNames := []string{"Telur Ayam", "Susu UHT", "Nasi Goreng", "Daging Sapi", "Wortel", "Tahu", "Tempe", "Kopi", "Teh Hijau", "Roti Tawar"}
	itemTypes := []string{"ingredient", "food", "drink"}

	// Generate 20 random items for random users
	for range 20 {
		randomUser := users[rand.Intn(len(users))]
		randomName := itemNames[rand.Intn(len(itemNames))]
		randomType := itemTypes[rand.Intn(len(itemTypes))]
		randomAmount := float64(rand.Intn(10) + 1)
		randomExp := time.Now().AddDate(0, 0, rand.Intn(14)+1) // expires in 1–14 days

		item := schema.Item{
			BaseModel: schema.BaseModel{ID: uuid.New()},
			UserID:    randomUser.ID,
			Name:      randomName,
			Type:      randomType,
			Amount:    randomAmount,
			ExpDate:   randomExp,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		err := database.DB.Create(&item).Error
		if err != nil {
			log.Fatalf("Failed to create item: %v", err)
		}
	}

	log.Println("Seed data inserted successfully.")
}
