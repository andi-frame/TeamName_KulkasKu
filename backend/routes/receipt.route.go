package routes

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
	"github.com/gin-gonic/gin"
)

func ReceiptRoute(r *gin.Engine, geminiService *service.GeminiService) {
	router := r.Group("/receipt")

	receiptService, err := service.NewReceiptService(geminiService)
	if err != nil {
		panic("Failed to create receipt service: " + err.Error())
	}
	receiptController := controller.NewReceiptController(receiptService)

	router.POST("/scan", receiptController.AnalyzeReceiptHandler)
}