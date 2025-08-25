package routes

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/gin-gonic/gin"
)

func AuthRoute(r *gin.Engine, cfg config.Config) {
	authRoutes := r.Group("/auth")

	authService := controller.NewAuthService(cfg)
	authRoutes.GET("/me", authService.MeHandler)
	authRoutes.POST("/register", authService.RegisterHandler)
	authRoutes.POST("/login", authService.LoginManualHandler)
	authRoutes.GET("/google/login", authService.LoginHandler)
	authRoutes.GET("/google/callback", authService.CallbackHandler)
	authRoutes.POST("/logout", authService.LogoutHandler)

	profileGroup := r.Group("/profile")
	profileGroup.Use(middleware.JWTMiddleware())
	profileGroup.GET("", controller.GetUserProfile)
}
