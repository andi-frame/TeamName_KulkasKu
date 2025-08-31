package routes

import (
	"github.com/gin-gonic/gin"

	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
)

func FoodJournalRoutes(router *gin.Engine, controller *controller.FoodJournalController) {
	foodJournalGroup := router.Group("/food-journal")
	foodJournalGroup.Use(middleware.JWTMiddleware())
	{
		foodJournalGroup.POST("/create", controller.CreateFoodJournal)
		foodJournalGroup.GET("/list", controller.GetFoodJournals)
		foodJournalGroup.GET("/today", controller.GetTodayFoodJournals)
		foodJournalGroup.GET("/nutrition-summary", controller.GetNutritionSummary)
		foodJournalGroup.GET("/dashboard", controller.GetDashboardData)
		foodJournalGroup.GET("/:id", controller.GetFoodJournalByID)
		foodJournalGroup.PUT("/:id", controller.UpdateFoodJournal)
		foodJournalGroup.DELETE("/:id", controller.DeleteFoodJournal)
	}
}
