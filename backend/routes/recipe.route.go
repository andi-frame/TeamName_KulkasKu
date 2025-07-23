package routes

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/gin-gonic/gin"
)

func RecipeRoute(r *gin.Engine, cfg config.Config) {
	recipeRoutes := r.Group("/recipe")
	recipeRoutes.Use(middleware.JWTMiddleware())

	recipeRoutes.GET("/all", controller.AllRecipesHandler)
	recipeRoutes.GET("/detail/:slug", controller.DetailRecipeHandler)
	// recipeRoutes.GET("/search", controller.SearchRecipeHandler)
}
