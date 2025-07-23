package repository

import (
	"errors"
	"log"

	"github.com/andi-frame/TeamName_KulkasKu/backend/database"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"gorm.io/gorm"
)

func UpsertUserAccount(userInfo schema.UserAuthType) (*schema.User, error) {
	var user schema.User

	result := database.DB.Where("email = ?", userInfo.Email).First(&user)

	if result.Error == nil {
		// User exists
		user.Name = userInfo.Name
		user.ImageURL = userInfo.Picture

		if err := database.DB.Save(&user).Error; err != nil {
			log.Printf("Error updating user: %v", err)
			return nil, err
		}
		log.Printf("Successfully updated user: %s with email %s", user.ID, user.Email)
		return &user, nil
	}

	if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Some other error
		log.Printf("DB error finding user: %v", result.Error)
		return nil, result.Error
	}

	// No user found, create new
	user = schema.User{
		Name:     userInfo.Name,
		Email:    userInfo.Email,
		ImageURL: userInfo.Picture,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		log.Printf("Error creating user: %v", err)
		return nil, err
	}

	log.Printf("Successfully created user: %s with email %s", user.ID, user.Email)
	return &user, nil
}
