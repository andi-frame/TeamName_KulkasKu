package routes

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/gin-gonic/gin"
)

func ItemRoute(r *gin.Engine, cfg config.Config) {
	itemRoutes := r.Group("/item")
	itemRoutes.Use(middleware.JWTMiddleware(cfg.JWTSecret))

	itemRoutes.POST("/create", controller.CreateNewItemHandler)
	itemRoutes.POST("/all", controller.GetAllItemHandler)
}
