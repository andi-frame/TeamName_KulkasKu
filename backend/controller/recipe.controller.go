package controller

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/gin-gonic/gin"
)

func AllRecipesHandler(c *gin.Context) {
	// user, exists := c.Get("user")
	// if !exists {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
	// 	return
	// }

	// userData := user.(middleware.JWTUserData)

	keyword := c.DefaultQuery("keyword", "ayam-ketumbar-lada-buncis")
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "10")

	apiURL := "https://www.yummy.co.id/api/search/open-search/recipe?type=home&keyword=" +
		keyword + "&page=" + page + "&limit=" + limit

	resp, err := http.Get(apiURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch from Yummy API"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response body"})
		return
	}

	var recipeList schema.RecipeListResponse
	if err := json.Unmarshal(body, &recipeList); err != nil {
		fmt.Println("Unmarshal error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse API response"})
		return
	}

	c.JSON(http.StatusOK, recipeList.Data.Result)
}

func DetailRecipeHandler(c *gin.Context) {
	slug := c.Param("slug")

	resp, err := http.Get("https://www.yummy.co.id/api/recipe/detail/" + slug)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
		return
	}

	var detailResponse schema.RecipeDetailResponse
	if err := json.Unmarshal(body, &detailResponse); err != nil {
		fmt.Println("Unmarshal error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse response"})
		return
	}

	c.JSON(resp.StatusCode, detailResponse.Data)
}

// func SearchRecipeHandler(c *gin.Context) {

// }
