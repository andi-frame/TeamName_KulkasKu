package controller

import (
	"net/http"

	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RecipeController struct {
	recipeService *service.RecipeService
}

func NewRecipeController(recipeService *service.RecipeService) *RecipeController {
	return &RecipeController{
		recipeService: recipeService,
	}
}

func (rc *RecipeController) GenerateRecipesHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userData := user.(middleware.JWTUserData)
	userID, err := uuid.Parse(userData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	recipes, err := rc.recipeService.GenerateRecipes(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, recipes)
}