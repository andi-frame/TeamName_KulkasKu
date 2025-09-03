package routes

import (
	"github.com/gin-gonic/gin"

	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
)

func FoodJournalRoutes(router *gin.Engine, cfg config.Config) {
	foodJournalGroup := router.Group("/food-journal")
	foodJournalGroup.Use(middleware.JWTMiddleware())
	{
		foodJournalGroup.POST("/analyze-text", controller.AnalyzeFoodFromTextHandler)
		foodJournalGroup.POST("/analyze-image", controller.AnalyzeFoodFromImageHandler)

		foodJournalGroup.POST("/create", controller.CreateNewFoodJournalHandler)
		foodJournalGroup.GET("/all", controller.GetAllFoodJournalHandler)
		foodJournalGroup.GET("/today", controller.GetTodayFoodJournalHandler)
		foodJournalGroup.GET("/dashboard", controller.GetFoodJournalDashboardHandler)
		// foodJournalGroup.GET("/search", controller.GetFilteredFoodJournalHandler)
		// foodJournalGroup.GET("/meal-type", controller.GetFoodJournalByMealTypeHandler)
		foodJournalGroup.GET("/:id", controller.GetFoodJournalByIDHandler)
		foodJournalGroup.PUT("/update", controller.UpdateFoodJournalHandler)
		foodJournalGroup.DELETE("/delete/:id", controller.DeleteFoodJournalHandler)
	}
}
