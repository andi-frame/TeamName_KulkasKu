package repository

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
)

type FoodJournalRepository struct {
	db *gorm.DB
}

func NewFoodJournalRepository(db *gorm.DB) *FoodJournalRepository {
	return &FoodJournalRepository{db: db}
}

func (r *FoodJournalRepository) Create(foodJournal *schema.FoodJournal) error {
	return r.db.Create(foodJournal).Error
}

func (r *FoodJournalRepository) GetByID(id uuid.UUID) (*schema.FoodJournal, error) {
	var foodJournal schema.FoodJournal
	err := r.db.Preload("User").First(&foodJournal, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &foodJournal, nil
}

func (r *FoodJournalRepository) GetByUserID(userID uuid.UUID, limit, offset int) ([]schema.FoodJournal, error) {
	var foodJournals []schema.FoodJournal
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&foodJournals).Error
	return foodJournals, err
}

func (r *FoodJournalRepository) GetByUserIDAndDateRange(userID uuid.UUID, startDate, endDate time.Time) ([]schema.FoodJournal, error) {
	var foodJournals []schema.FoodJournal
	err := r.db.Where("user_id = ? AND created_at BETWEEN ? AND ?", userID, startDate, endDate).
		Order("created_at DESC").
		Find(&foodJournals).Error
	return foodJournals, err
}

func (r *FoodJournalRepository) GetTodayByUserID(userID uuid.UUID) ([]schema.FoodJournal, error) {
	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	return r.GetByUserIDAndDateRange(userID, startOfDay, endOfDay)
}

func (r *FoodJournalRepository) Update(id uuid.UUID, updates map[string]interface{}) error {
	return r.db.Model(&schema.FoodJournal{}).Where("id = ?", id).Updates(updates).Error
}

func (r *FoodJournalRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&schema.FoodJournal{}, "id = ?", id).Error
}

func (r *FoodJournalRepository) GetNutritionSummaryByUserID(userID uuid.UUID, startDate, endDate time.Time) (*schema.AINutrition, error) {
	var result struct {
		TotalCalories float64 `json:"total_calories"`
		TotalProtein  float64 `json:"total_protein"`
		TotalCarbs    float64 `json:"total_carbs"`
		TotalFat      float64 `json:"total_fat"`
		TotalSugar    float64 `json:"total_sugar"`
		TotalFiber    float64 `json:"total_fiber"`
		TotalSodium   float64 `json:"total_sodium"`
	}

	err := r.db.Model(&schema.FoodJournal{}).
		Select(`
			SUM(ai_calories) as total_calories,
			SUM(ai_protein) as total_protein,
			SUM(ai_carbs) as total_carbs,
			SUM(ai_fat) as total_fat,
			SUM(ai_sugar) as total_sugar,
			SUM(ai_fiber) as total_fiber,
			SUM(ai_sodium) as total_sodium
		`).
		Where("user_id = ? AND created_at BETWEEN ? AND ?", userID, startDate, endDate).
		Scan(&result).Error

	if err != nil {
		return nil, err
	}

	return &schema.AINutrition{
		Calories: result.TotalCalories,
		Protein:  result.TotalProtein,
		Carbs:    result.TotalCarbs,
		Fat:      result.TotalFat,
		Sugar:    result.TotalSugar,
		Fiber:    result.TotalFiber,
		Sodium:   result.TotalSodium,
	}, nil
}

func (r *FoodJournalRepository) GetMealsByType(userID uuid.UUID, mealType string, limit int) ([]schema.FoodJournal, error) {
	var foodJournals []schema.FoodJournal
	err := r.db.Where("user_id = ? AND meal_type = ?", userID, mealType).
		Order("created_at DESC").
		Limit(limit).
		Find(&foodJournals).Error
	return foodJournals, err
}
