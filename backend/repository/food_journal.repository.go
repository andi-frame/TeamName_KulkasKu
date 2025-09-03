package repository

import (
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/database"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
)

func GetAllFoodJournalByUserID(userID string) ([]schema.FoodJournal, error) {
	var journals []schema.FoodJournal
	result := database.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&journals)
	if result.Error != nil {
		return nil, result.Error
	}
	return journals, nil
}

func GetFoodJournalByID(journalID string) (*schema.FoodJournal, error) {
	var journal schema.FoodJournal
	result := database.DB.Where("id = ?", journalID).First(&journal)
	if result.Error != nil {
		return nil, result.Error
	}
	return &journal, nil
}

func GetTodayFoodJournalByUserID(userID string) ([]schema.FoodJournal, error) {
	var journals []schema.FoodJournal
	today := time.Now().Format("2006-01-02")
	result := database.DB.Where("user_id = ? AND DATE(created_at) = ?", userID, today).Order("created_at DESC").Find(&journals)
	if result.Error != nil {
		return nil, result.Error
	}
	return journals, nil
}

func GetRecentFoodJournalByUserID(userID string, limit int) ([]schema.FoodJournal, error) {
	var journals []schema.FoodJournal
	result := database.DB.Where("user_id = ?", userID).Order("created_at DESC").Limit(limit).Find(&journals)
	if result.Error != nil {
		return nil, result.Error
	}
	return journals, nil
}

func GetFilteredFoodJournal(userID string, mealName string, startDate, endDate *time.Time, mealType string) ([]schema.FoodJournal, error) {
	var journals []schema.FoodJournal

	query := database.DB.Where("user_id = ?", userID)

	if mealName != "" {
		query = query.Where("meal_name ILIKE ?", "%"+mealName+"%")
	}

	if startDate != nil {
		query = query.Where("created_at >= ?", *startDate)
	}

	if endDate != nil {
		query = query.Where("created_at <= ?", *endDate)
	}

	if mealType != "" && mealType != "all" {
		query = query.Where("meal_type = ?", mealType)
	}

	result := query.Order("created_at DESC").Find(&journals)
	if result.Error != nil {
		return nil, result.Error
	}
	return journals, nil
}

func GetFoodJournalByMealType(userID string, mealType string) ([]schema.FoodJournal, error) {
	var journals []schema.FoodJournal
	result := database.DB.Where("user_id = ? AND meal_type = ?", userID, mealType).Order("created_at DESC").Find(&journals)
	if result.Error != nil {
		return nil, result.Error
	}
	return journals, nil
}

func CreateNewFoodJournal(journal schema.FoodJournal, userID string) error {
	result := database.DB.Create(&journal)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func UpdateFoodJournal(journal schema.FoodJournal) error {
	return database.DB.Model(&schema.FoodJournal{}).
		Where("id = ?", journal.ID).
		Updates(map[string]any{
			"meal_name":       journal.MealName,
			"meal_type":       journal.MealType,
			"description":     journal.Description,
			"feeling_before":  journal.FeelingBefore,
			"feeling_after":   journal.FeelingAfter,
			"input_type":      journal.InputType,
			"raw_input":       journal.RawInput,
			"processed_input": journal.ProcessedInput,
			"food_analysis":   journal.FoodAnalysis,
			"updated_at":      journal.UpdatedAt,
		}).Error
}

func DeleteFoodJournal(journalID string) error {
	result := database.DB.Delete(&schema.FoodJournal{}, "id = ?", journalID)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
