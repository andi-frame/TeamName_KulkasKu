package routes

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
	"github.com/gin-gonic/gin"
)

func ReceiptRoute(r *gin.Engine, cfg config.Config) {
	router := r.Group("/receipt")

	receiptService := service.NewReceiptService(cfg.PythonServiceURL)
	receiptController := controller.NewReceiptController(receiptService)

	router.POST("/scan", receiptController.ScanReceiptHandler)

	router.GET("/health", receiptController.HealthCheckHandler)
}
