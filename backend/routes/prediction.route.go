package routes

import (
	"log"

	"github.com/gin-gonic/gin"

	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
)

func PredictionRoute(r *gin.Engine, cfg config.Config) {
	router := r.Group("/predict")

	geminiService, err := service.NewGeminiService()
	if err != nil {
		log.Fatalf("Failed to create Gemini service: %v", err)
	}
	predictionController := controller.NewPredictionController(geminiService)

	router.POST("/image", predictionController.PredictItemHandler)

	router.GET("/health", predictionController.HealthCheckHandler)
}
