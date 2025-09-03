package routes

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/gin-gonic/gin"
)

func ActivityRoute(r *gin.Engine, activityController *controller.ActivityController) {
	activityRoutes := r.Group("/activity")
	activityRoutes.Use(middleware.JWTMiddleware())

	activityRoutes.POST("/recipe", activityController.RecordRecipeActivityHandler)
}
