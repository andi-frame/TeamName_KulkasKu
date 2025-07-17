package controller

import (
	"net/http"

	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/gin-gonic/gin"
)

func AllRecipesHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userData := user.(middleware.JWTUserData)

	c.JSON(http.StatusOK, gin.H{
		"message": "Hello from /recipe/all!",
		"user": gin.H{
			"id":    userData.ID,
			"email": userData.Email,
			"name":  userData.Name,
		},
	})

}

func SearchRecipeHandler(c *gin.Context) {

}
