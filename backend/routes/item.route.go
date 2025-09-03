package routes

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/gin-gonic/gin"
)

func ItemRoute(r *gin.Engine, itemController *controller.ItemController) {
	itemRoutes := r.Group("/item")
	itemRoutes.Use(middleware.JWTMiddleware())

	itemRoutes.POST("/create", itemController.CreateNewItemHandler)
	itemRoutes.GET("/all", itemController.GetAllItemHandler)
	itemRoutes.GET("/expired", itemController.GetAllExpiredItemHandler)
	itemRoutes.GET("/expired/search", itemController.GetSearchedExpiredItemHandler)
	itemRoutes.GET("/fresh", itemController.GetAllFreshItemHandler)
	itemRoutes.GET("/fresh/search", itemController.GetSearchedFreshItemHandler)
	itemRoutes.PUT("/update", itemController.UpdateItemHandler)
	itemRoutes.DELETE("/delete/:id", itemController.DeleteItemHandler)
}