package routes

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/gin-gonic/gin"
)

func AuthRoute(r *gin.Engine, cfg config.Config) {
	authRoutes := r.Group("/auth")

	authService := controller.NewAuthService(cfg)
	authRoutes.GET("/login", authService.LoginHandler)
	authRoutes.GET("/callback", authService.CallbackHandler)
}
