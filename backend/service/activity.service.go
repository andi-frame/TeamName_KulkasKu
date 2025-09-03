package service

import (
	"fmt"
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/google/uuid"
)

type ActivityService struct{}

func NewActivityService() *ActivityService {
	return &ActivityService{}
}

func (s *ActivityService) RecordRecipeActivityAndUpdatePreferences(userID uuid.UUID, requestData schema.RecipeActivityRequest) error {
	// 1. Create UserActivity
	activity := &schema.UserActivity{
		UserID:       userID,
		RecipeID:     requestData.ID,
		ActivityType: requestData.ActivityType,
		ViewDuration: requestData.ViewDuration,
		CookingTime:  requestData.CookingTime,
		Calories:     requestData.Calories,
		Price:        requestData.Price,
		ServingSize:  requestData.ServingMax, // or a calculated average
		SessionID:    "",                   // This would require session tracking
		CreatedAt:    time.Now(),
	}

	if err := repository.CreateUserActivity(activity); err != nil {
		return fmt.Errorf("failed to create user activity: %w", err)
	}

	// 2. Get current preferences and activities
	preference, err := repository.GetUserPreference(userID)
	if err != nil {
		return fmt.Errorf("failed to get user preference: %w", err)
	}

	activities, err := repository.GetUserActivities(userID)
	if err != nil {
		return fmt.Errorf("failed to get user activities: %w", err)
	}

	// 3. Update Averages (Moving Average)
	n := float64(len(activities))
	if n > 0 {
		preference.AvgCookingTime = int((float64(preference.AvgCookingTime)*(n-1) + float64(requestData.CookingTime)) / n)
		// Note: recipeData.Calories is a string like "350 kcal". This needs parsing.
		// For now, we'll skip updating calories until the schema is consistent.
	}

	preference.LastUpdated = time.Now()
	if err := repository.UpdateUserPreference(preference); err != nil {
		return fmt.Errorf("failed to update user preference averages: %w", err)
	}

	// 4. Update Preferred Tags
	var tagNames []string
	for _, tag := range requestData.Tags {
		tagNames = append(tagNames, tag.Name)
	}

	if len(tagNames) > 0 {
		if err := repository.AddPreferredTags(userID, tagNames); err != nil {
			return fmt.Errorf("failed to add preferred tags: %w", err)
		}
	}

	return nil
}
