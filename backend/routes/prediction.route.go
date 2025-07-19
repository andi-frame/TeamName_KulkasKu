package routes

import (
    "github.com/gin-gonic/gin"
    "github.com/andi-frame/TeamName_KulkasKu/backend/config"
    "github.com/andi-frame/TeamName_KulkasKu/backend/controller"
    "github.com/andi-frame/TeamName_KulkasKu/backend/service"
)

func PredictionRoute(r *gin.Engine, cfg config.Config) {
    router := r.Group("/predict")

    predictionService := service.NewAIPredictionService(cfg.PythonServiceURL) 
    predictionController := controller.NewPredictionController(predictionService)

    // Endpoint untuk prediksi gambar
    router.POST("/image", predictionController.PredictItemHandler)
    
    // Endpoint untuk health check
    router.GET("/health", predictionController.HealthCheckHandler)
}
