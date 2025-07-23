package repository

import (
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RecommendationRepository struct {
	db *gorm.DB
}

func NewRecommendationRepository(db *gorm.DB) *RecommendationRepository {
	return &RecommendationRepository{db: db}
}

// User Preference methods
func (r *RecommendationRepository) GetUserPreference(userID uuid.UUID) (*schema.UserPreference, error) {
	var pref schema.UserPreference
	err := r.db.Where("user_id = ?", userID).First(&pref).Error
	if err != nil {
		return nil, err
	}
	return &pref, nil
}

func (r *RecommendationRepository) UpsertUserPreference(pref *schema.UserPreference) error {
	return r.db.Save(pref).Error
}

// User Activity methods
func (r *RecommendationRepository) CreateActivity(activity *schema.UserActivity) error {
	return r.db.Create(activity).Error
}

func (r *RecommendationRepository) GetUserActivities(userID uuid.UUID, limit int) ([]schema.UserActivity, error) {
	var activities []schema.UserActivity
	err := r.db.Where("user_id = ? AND created_at >= ?", userID, time.Now().AddDate(0, -3, 0)).
		Order("created_at DESC").
		Limit(limit).
		Find(&activities).Error
	return activities, err
}

func (r *RecommendationRepository) GetAllUserActivitiesForLearning() ([]schema.UserActivity, error) {
	var activities []schema.UserActivity
	err := r.db.Where("created_at >= ?", time.Now().AddDate(0, -3, 0)).
		Order("created_at DESC").
		Find(&activities).Error
	return activities, err
}
