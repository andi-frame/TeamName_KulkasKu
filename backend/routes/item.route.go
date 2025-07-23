package routes

import (
	"fmt"

	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/gin-gonic/gin"
)

func ItemRoute(r *gin.Engine, cfg config.Config) {
	r.Use(func(c *gin.Context) {
		fmt.Println("Request Path:", c.Request.Method, c.Request.URL.Path)
		c.Next()
	})
	r.Use(gin.Logger())
	itemRoutes := r.Group("/item")
	itemRoutes.Use(middleware.JWTMiddleware())

	itemRoutes.POST("/create", controller.CreateNewItemHandler)
	itemRoutes.GET("/all", controller.GetAllItemHandler)
	itemRoutes.GET("/expired", controller.GetAllExpiredItemHandler)
	itemRoutes.GET("/fresh", controller.GetAllFreshItemHandler)
	itemRoutes.PUT("/update", controller.UpdateItemHandler)
	itemRoutes.DELETE("/delete/:id", controller.DeleteItemHandler)

}
