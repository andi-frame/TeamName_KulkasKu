package routes

import (
	"github.com/gin-gonic/gin"

	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
)

func PredictionRoute(r *gin.Engine, controller *controller.PredictionController) {
	router := r.Group("/predict")

	router.POST("/image", controller.PredictItemHandler)

	router.GET("/health", controller.HealthCheckHandler)
}
