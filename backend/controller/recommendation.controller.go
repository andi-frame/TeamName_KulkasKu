package controller

import (
	"net/http"
	"strconv"

	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RecommendationController struct {
	service *service.RecommendationService
}

func NewRecommendationController(service *service.RecommendationService) *RecommendationController {
	return &RecommendationController{service: service}
}

// POST /recipe/track
func (c *RecommendationController) TrackRecipeInteraction(ctx *gin.Context) {
	var req struct {
		RecipeID     string                 `json:"recipe_id" binding:"required"`
		ActivityType string                 `json:"activity_type" binding:"required"` // "view", "detail_view", "cooked"
		ViewDuration int                    `json:"view_duration"`
		RecipeData   map[string]any `json:"recipe_data"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context (assume from auth middleware)
	userID, _ := ctx.Get("user_id")
	uid := userID.(uuid.UUID)

	err := c.service.TrackRecipeInteraction(uid, req.RecipeID, req.ActivityType, req.ViewDuration, req.RecipeData)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to track interaction"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Interaction tracked successfully"})
}

// GET /recipe/recommendations
func (c *RecommendationController) GetRecommendations(ctx *gin.Context) {
	// Get user ID from context
	user, _ := ctx.Get("user")
	userData := user.(middleware.JWTUserData)
	userIdStr := userData.ID
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Get limit parameter
	limitStr := ctx.DefaultQuery("limit", "10")
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	recipes, err := c.service.GetRecommendations(userId, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get recommendations"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":  recipes,
		"count": len(recipes),
	})
}

// POST /admin/recipe/update-preferences (admin endpoint for batch learning)
func (c *RecommendationController) UpdateAllUserPreferences(ctx *gin.Context) {
	err := c.service.UpdateUserPreferences()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update preferences"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "User preferences updated successfully"})
}
