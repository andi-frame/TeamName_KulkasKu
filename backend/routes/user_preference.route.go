package routes

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/gin-gonic/gin"
)

func UserPreferenceRoute(r *gin.Engine) {
	userPreferenceRoutes := r.Group("/profile")
	userPreferenceRoutes.Use(middleware.JWTMiddleware())

	userPreferenceRoutes.POST("/onboarding", controller.OnboardingHandler)
	userPreferenceRoutes.PUT("/onboarding", controller.UpdateOnboardingDataHandler)
}
