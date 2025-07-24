package routes

import (
	"fmt"

	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/gin-gonic/gin"
)

func CartRoute(r *gin.Engine, cfg config.Config) {
	r.Use(func(c *gin.Context) {
		fmt.Println("Request Path:", c.Request.Method, c.Request.URL.Path)
		c.Next()
	})
	r.Use(gin.Logger())
	cartRoutes := r.Group("/cart")
	cartRoutes.Use(middleware.JWTMiddleware())

	cartRoutes.POST("/create", controller.CreateNewCartHandler)
	cartRoutes.POST("/item/create", controller.CreateCartItemHandler)
	cartRoutes.GET("/all", controller.GetAllCartHandler)
	cartRoutes.GET("/:id", controller.GetCartDetailHandler)
	cartRoutes.GET("/:id/items", controller.GetCartItemsHandler)
	cartRoutes.PUT("/update", controller.UpdateCartHandler)
	cartRoutes.DELETE("/delete/:id", controller.DeleteCartHandler)
}
