package controller

import (
	"net/http"

	"github.com/andi-frame/TeamName_KulkasKu/backend/database"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OnboardingRequest struct {
	DailyFoodCost float64 `json:"daily_food_cost"`
	BMI           float64 `json:"bmi"`
	DailyActivity string  `json:"daily_activity"`
	HealthTarget  string  `json:"health_target"`
	FridgeCapacity int    `json:"fridge_capacity"`
}

func OnboardingHandler(c *gin.Context) {
	userCtx, _ := c.Get("user")
	userData := userCtx.(middleware.JWTUserData)
	userID, _ := uuid.Parse(userData.ID)

	var req OnboardingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var userPref schema.UserPreference
	if err := database.DB.Where("user_id = ?", userID).First(&userPref).Error; err != nil {
		// Create new preference if not found
		userPref = schema.UserPreference{
			UserID: userID,
		}
	}

	userPref.DailyFoodCost = req.DailyFoodCost
	userPref.BMI = req.BMI
	userPref.DailyActivity = req.DailyActivity
	userPref.HealthTarget = req.HealthTarget
	userPref.FridgeCapacity = req.FridgeCapacity
	userPref.HasOnboarded = true

	if err := database.DB.Save(&userPref).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save onboarding data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Onboarding data saved successfully"})
}
