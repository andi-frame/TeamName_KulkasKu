package repository

import (
	"log"

	"github.com/andi-frame/TeamName_KulkasKu/backend/database"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"gorm.io/gorm/clause"
)

func UpsertUserAccount(userInfo schema.UserAuthType) (*schema.User, error) {

	user := schema.User{
		ImageURL: userInfo.Picture,
		Name:     userInfo.Name,
		Email:    userInfo.Email,
	}

	result := database.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "email"}},
		DoUpdates: clause.AssignmentColumns([]string{"name", "image_url"}),
	}).Create(&user)

	if result.Error != nil {
		log.Printf("Error during upsert user: %v", result.Error)
		return nil, result.Error
	}

	log.Printf("Successfully upserted user with email: %s", user.Email)
	return &user, nil
}
