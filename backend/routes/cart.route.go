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
	cartRoutes.GET("/all", controller.GetAllCartHandler)
	cartRoutes.GET("/all", controller.GetCartDetailHandler)
	cartRoutes.PUT("/update", controller.UpdateCartHandler)
	cartRoutes.DELETE("/delete/:id", controller.DeleteCartHandler)
}
