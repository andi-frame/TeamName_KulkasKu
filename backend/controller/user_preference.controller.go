package controller

import (
	"fmt"
	"net/http"

	"github.com/andi-frame/TeamName_KulkasKu/backend/database"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OnboardingRequest struct {
	DailyFoodCost  float64 `json:"dailyFoodCost"`
	Age            int     `json:"age"`
	BMI            float64 `json:"bmi"`
	BloodSugar     int     `json:"bloodSugar"`
	Cholesterol    int     `json:"cholesterol"`
	BloodPressure  string  `json:"bloodPressure"`
	DailyActivity  string  `json:"dailyActivity"`
	HealthTarget   string  `json:"healthTarget"`
	FridgeCapacity int     `json:"fridgeCapacity"`
	FridgeModel    string  `json:"fridgeModel"`
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

	fmt.Printf("Received onboarding data: %+v\n", req)

	var userPref schema.UserPreference
	if err := database.DB.Where("user_id = ?", userID).First(&userPref).Error; err != nil {
		// Create new preference if not found
		userPref = schema.UserPreference{
			UserID: userID,
		}
	}

	userPref.DailyFoodCost = req.DailyFoodCost
	userPref.Age = req.Age
	userPref.BMI = req.BMI
	userPref.BloodSugar = req.BloodSugar
	userPref.Cholesterol = req.Cholesterol
	userPref.BloodPressure = req.BloodPressure
	userPref.DailyActivity = req.DailyActivity
	userPref.HealthTarget = req.HealthTarget
	userPref.FridgeCapacity = req.FridgeCapacity
	userPref.FridgeModel = req.FridgeModel

	if err := database.DB.Save(&userPref).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save onboarding data"})
		return
	}

	// Update HasOnboarded flag on User
	var user schema.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	user.HasOnboarded = true
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user onboarding status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Onboarding data saved successfully"})
}

func UpdateOnboardingDataHandler(c *gin.Context) {
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
		c.JSON(http.StatusNotFound, gin.H{"error": "User preference not found"})
		return
	}

	userPref.DailyFoodCost = req.DailyFoodCost
	userPref.Age = req.Age
	userPref.BMI = req.BMI
	userPref.BloodSugar = req.BloodSugar
	userPref.Cholesterol = req.Cholesterol
	userPref.BloodPressure = req.BloodPressure
	userPref.DailyActivity = req.DailyActivity
	userPref.HealthTarget = req.HealthTarget
	userPref.FridgeCapacity = req.FridgeCapacity
	userPref.FridgeModel = req.FridgeModel

	if err := database.DB.Save(&userPref).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update onboarding data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Onboarding data updated successfully"})
}
