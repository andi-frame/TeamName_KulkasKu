package repository

import (
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/database"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
)

func GetAllItemByUserID(userID string) ([]schema.Item, error) {
	var items []schema.Item
	result := database.DB.Where("user_id = ?", userID).Find(&items).Order("exp_date ASC")
	if result.Error != nil {
		return nil, result.Error
	}
	return items, nil
}

func GetAllFreshItem(userID string) ([]schema.Item, error) {
	var items []schema.Item
	result := database.DB.Where("user_id = ?", userID).Where("exp_date > ?", time.Now().UTC()).Find(&items).Order("exp_date ASC")
	if result.Error != nil {
		return nil, result.Error
	}
	return items, nil
}

func GetAllExpiredItem(userID string) ([]schema.Item, error) {
	var items []schema.Item
	result := database.DB.Where("user_id = ?", userID).Where("exp_date < ?", time.Now().UTC()).Find(&items).Order("exp_date DESC")
	if result.Error != nil {
		return nil, result.Error
	}
	return items, nil
}

func CreateNewItem(item schema.Item, userID string) error {
	result := database.DB.Create(&item).Where("user_id = ?", userID)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
