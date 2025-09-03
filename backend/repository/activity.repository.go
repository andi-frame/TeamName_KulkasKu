package repository

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/database"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CreateUserActivity(activity *schema.UserActivity) error {
	return database.DB.Create(activity).Error
}

func GetUserActivities(userID uuid.UUID) ([]schema.UserActivity, error) {
	var activities []schema.UserActivity
	err := database.DB.Where("user_id = ?", userID).Find(&activities).Error
	return activities, err
}

func GetUserPreference(userID uuid.UUID) (*schema.UserPreference, error) {
	var preference schema.UserPreference
	if err := database.DB.Preload("PreferredTags").Where("user_id = ?", userID).First(&preference).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create a new preference if not found
			preference = schema.UserPreference{
				UserID: userID,
			}
			if err := database.DB.Create(&preference).Error; err != nil {
				return nil, err
			}
			return &preference, nil
		}
		return nil, err
	}
	return &preference, nil
}

func UpdateUserPreference(preference *schema.UserPreference) error {
	return database.DB.Save(preference).Error
}

func AddPreferredTags(userID uuid.UUID, tags []string) error {
	tx := database.DB.Begin()

	var preference schema.UserPreference
	if err := tx.Where("user_id = ?", userID).First(&preference).Error; err != nil {
		tx.Rollback()
		return err
	}

	for _, tagName := range tags {
		var existingTag schema.UserPreferenceTag
		if err := tx.Where("user_preference_id = ? AND tag = ?", preference.ID, tagName).First(&existingTag).Error; err == gorm.ErrRecordNotFound {
			newTag := schema.UserPreferenceTag{
				UserPreferenceID: preference.ID,
				Tag:              tagName,
			}
			if err := tx.Create(&newTag).Error; err != nil {
				tx.Rollback()
				return err
			}
		}
	}

	return tx.Commit().Error
}
