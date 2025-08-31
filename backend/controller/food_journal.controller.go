package controller

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
)

type FoodJournalController struct {
	service *service.FoodJournalService
}

func NewFoodJournalController(service *service.FoodJournalService) *FoodJournalController {
	return &FoodJournalController{service: service}
}

// POST /food-journal/create
func (c *FoodJournalController) CreateFoodJournal(ctx *gin.Context) {
	var req schema.FoodJournalCreate
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context
	user, _ := ctx.Get("user")
	userData := user.(middleware.JWTUserData)
	userID, err := uuid.Parse(userData.ID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	foodJournal, err := c.service.CreateFoodJournal(userID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := &schema.FoodJournalResponse{
		ID:                foodJournal.ID,
		CreatedAt:         foodJournal.CreatedAt,
		MealName:          foodJournal.MealName,
		MealType:          foodJournal.MealType,
		Description:       foodJournal.Description,
		FeelingBefore:     foodJournal.FeelingBefore,
		FeelingAfter:      foodJournal.FeelingAfter,
		ImageURL:          foodJournal.ImageURL,
		VoiceURL:          foodJournal.VoiceURL,
		TranscriptText:    foodJournal.TranscriptText,
		AINutrition:       foodJournal.AINutrition,
		AIFeedback:        foodJournal.AIFeedback,
		AIRecommendations: foodJournal.AIRecommendations,
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "Food journal created successfully",
		"data":    response,
	})
}

// GET /food-journal/list
func (c *FoodJournalController) GetFoodJournals(ctx *gin.Context) {
	// Get user ID from context
	user, _ := ctx.Get("user")
	userData := user.(middleware.JWTUserData)
	userID, err := uuid.Parse(userData.ID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Parse query parameters
	limitStr := ctx.DefaultQuery("limit", "20")
	offsetStr := ctx.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit parameter"})
		return
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offset parameter"})
		return
	}

	foodJournals, err := c.service.GetUserFoodJournals(userID, limit, offset)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to response format
	var responses []schema.FoodJournalResponse
	for _, fj := range foodJournals {
		responses = append(responses, schema.FoodJournalResponse{
			ID:                fj.ID,
			CreatedAt:         fj.CreatedAt,
			MealName:          fj.MealName,
			MealType:          fj.MealType,
			Description:       fj.Description,
			FeelingBefore:     fj.FeelingBefore,
			FeelingAfter:      fj.FeelingAfter,
			ImageURL:          fj.ImageURL,
			VoiceURL:          fj.VoiceURL,
			TranscriptText:    fj.TranscriptText,
			AINutrition:       fj.AINutrition,
			AIFeedback:        fj.AIFeedback,
			AIRecommendations: fj.AIRecommendations,
		})
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Food journals retrieved successfully",
		"data":    responses,
	})
}

// GET /food-journal/today
func (c *FoodJournalController) GetTodayFoodJournals(ctx *gin.Context) {
	// Get user ID from context
	user, _ := ctx.Get("user")
	userData := user.(middleware.JWTUserData)
	userID, err := uuid.Parse(userData.ID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	foodJournals, err := c.service.GetTodayFoodJournals(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to response format
	var responses []schema.FoodJournalResponse
	for _, fj := range foodJournals {
		responses = append(responses, schema.FoodJournalResponse{
			ID:                fj.ID,
			CreatedAt:         fj.CreatedAt,
			MealName:          fj.MealName,
			MealType:          fj.MealType,
			Description:       fj.Description,
			FeelingBefore:     fj.FeelingBefore,
			FeelingAfter:      fj.FeelingAfter,
			ImageURL:          fj.ImageURL,
			VoiceURL:          fj.VoiceURL,
			TranscriptText:    fj.TranscriptText,
			AINutrition:       fj.AINutrition,
			AIFeedback:        fj.AIFeedback,
			AIRecommendations: fj.AIRecommendations,
		})
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Today's food journals retrieved successfully",
		"data":    responses,
	})
}

// GET /food-journal/nutrition-summary
func (c *FoodJournalController) GetNutritionSummary(ctx *gin.Context) {
	// Get user ID from context
	user, _ := ctx.Get("user")
	userData := user.(middleware.JWTUserData)
	userID, err := uuid.Parse(userData.ID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Parse date parameters
	startDateStr := ctx.Query("start_date")
	endDateStr := ctx.Query("end_date")

	var startDate, endDate time.Time
	if startDateStr != "" {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_date format (use YYYY-MM-DD)"})
			return
		}
	} else {
		// Default to today
		startDate = time.Now().Truncate(24 * time.Hour)
	}

	if endDateStr != "" {
		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_date format (use YYYY-MM-DD)"})
			return
		}
		endDate = endDate.Add(24 * time.Hour) // Include the entire day
	} else {
		// Default to end of today
		endDate = startDate.Add(24 * time.Hour)
	}

	nutrition, err := c.service.GetNutritionSummary(userID, startDate, endDate)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Nutrition summary retrieved successfully",
		"data":    nutrition,
	})
}

// GET /food-journal/dashboard
func (c *FoodJournalController) GetDashboardData(ctx *gin.Context) {
	// Get user ID from context
	user, _ := ctx.Get("user")
	userData := user.(middleware.JWTUserData)
	userID, err := uuid.Parse(userData.ID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	dashboardData, err := c.service.GetDashboardData(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Dashboard data retrieved successfully",
		"data":    dashboardData,
	})
}

// GET /food-journal/:id
func (c *FoodJournalController) GetFoodJournalByID(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid journal ID"})
		return
	}

	foodJournal, err := c.service.GetFoodJournalByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Food journal not found"})
		return
	}

	response := &schema.FoodJournalResponse{
		ID:                foodJournal.ID,
		CreatedAt:         foodJournal.CreatedAt,
		MealName:          foodJournal.MealName,
		MealType:          foodJournal.MealType,
		Description:       foodJournal.Description,
		FeelingBefore:     foodJournal.FeelingBefore,
		FeelingAfter:      foodJournal.FeelingAfter,
		ImageURL:          foodJournal.ImageURL,
		VoiceURL:          foodJournal.VoiceURL,
		TranscriptText:    foodJournal.TranscriptText,
		AINutrition:       foodJournal.AINutrition,
		AIFeedback:        foodJournal.AIFeedback,
		AIRecommendations: foodJournal.AIRecommendations,
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Food journal retrieved successfully",
		"data":    response,
	})
}

// PUT /food-journal/:id
func (c *FoodJournalController) UpdateFoodJournal(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid journal ID"})
		return
	}

	var req schema.FoodJournalUpdate
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = c.service.UpdateFoodJournal(id, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Food journal updated successfully",
	})
}

// DELETE /food-journal/:id
func (c *FoodJournalController) DeleteFoodJournal(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid journal ID"})
		return
	}

	err = c.service.DeleteFoodJournal(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Food journal deleted successfully",
	})
}
