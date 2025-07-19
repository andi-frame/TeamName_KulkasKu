package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
)

func ProductRoute(r *gin.Engine, cfg config.Config) {
	router := r.Group("/product-info")

	productService := service.NewProductService()
	productController := controller.NewProductController(productService)

	router.POST("/:barcode", productController.GetProductInfoByBarcodeHandler)
	
	router.GET("/health", productController.HealthCheckHandler)
}