package routes

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/gin-gonic/gin"
)

func RecipeRoute(r *gin.Engine, recipeController *controller.RecipeController) {
	recipeRoutes := r.Group("/recipe")
	recipeRoutes.Use(middleware.JWTMiddleware())

	recipeRoutes.GET("/all", recipeController.GetRecipesHandler)
}
