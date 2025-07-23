package routes

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/gin-gonic/gin"
)

func RecommendationRoute(r *gin.Engine, recController *controller.RecommendationController) {
	recipe := r.Group("/recipe")
	recipe.Use(middleware.JWTMiddleware())

	// Recipe tracking
	recipe.POST("/track", recController.TrackRecipeInteraction)

	// Get recommendations
	recipe.GET("/recommendations", recController.GetRecommendations)

	// Admin routes
	admin := r.Group("/admin/recipe")
	admin.POST("/update-preferences", recController.UpdateAllUserPreferences)
}
