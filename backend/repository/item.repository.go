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
	result := database.DB.Create(&item)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func UpdateItem(item schema.Item) error {
	return database.DB.Model(&schema.Item{}).
		Where("id = ?", item.ID).
		Updates(map[string]any{
			"name":        item.Name,
			"type":        item.Type,
			"amount":      item.Amount,
			"amount_type": item.AmountType,
			"desc":        item.Desc,
			"start_date":  item.StartDate,
			"exp_date":    item.ExpDate,
		}).Error
}

func DeleteItem(itemID string) error {
	result := database.DB.Delete(&schema.Item{}, "id = ?", itemID)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
