package controller

import (
	"log"
	"net/http"
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ItemController struct {
	recipeService *service.RecipeService
}

func NewItemController(recipeService *service.RecipeService) *ItemController {
	return &ItemController{
		recipeService: recipeService,
	}
}

type ItemRequest struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Type       string  `json:"type"`
	Amount     float64 `json:"amount"`
	AmountType string  `json:"amountType"`
	Desc       string  `json:"desc"`      // optional
	StartDate  string  `json:"startDate"` // format: yyyy-mm-dd
	ExpDate    string  `json:"expDate"`   // format: yyyy-mm-dd
}

func (ctrl *ItemController) GetAllItemHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userData := user.(middleware.JWTUserData)

	data, err := repository.GetAllItemByUserID(userData.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": data,
	})
}

func (ctrl *ItemController) GetAllExpiredItemHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userData := user.(middleware.JWTUserData)

	data, err := repository.GetAllExpiredItem(userData.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": data,
	})
}

func (ctrl *ItemController) GetSearchedExpiredItemHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userData := user.(middleware.JWTUserData)
	searchName := c.Query("name")
	startDateStr := c.Query("startDate")
	expDateStr := c.Query("expDate")
	itemType := c.Query("itemType")

	var startDate, expDate *time.Time

	if startDateStr != "" {
		if t, err := time.Parse("2006-01-02", startDateStr); err == nil {
			startDate = &t
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid startDate format"})
			return
		}
	}

	if expDateStr != "" {
		if t, err := time.Parse("2006-01-02", expDateStr); err == nil {
			expDate = &t
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expDate format"})
			return
		}
	}

	data, err := repository.GetFilteredExpiredItem(userData.ID, searchName, startDate, expDate, itemType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": data,
	})
}

func (ctrl *ItemController) GetAllFreshItemHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userData := user.(middleware.JWTUserData)

	data, err := repository.GetAllFreshItem(userData.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": data,
	})
}

func (ctrl *ItemController) GetSearchedFreshItemHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userData := user.(middleware.JWTUserData)
	searchName := c.Query("name")
	startDateStr := c.Query("startDate")
	expDateStr := c.Query("expDate")
	itemType := c.Query("itemType")

	var startDate, expDate *time.Time

	if startDateStr != "" {
		if t, err := time.Parse("2006-01-02", startDateStr); err == nil {
			startDate = &t
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid startDate format"})
			return
		}
	}

	if expDateStr != "" {
		if t, err := time.Parse("2006-01-02", expDateStr); err == nil {
			expDate = &t
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expDate format"})
			return
		}
	}

	data, err := repository.GetFilteredFreshItem(userData.ID, searchName, startDate, expDate, itemType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": data,
	})
}

func (ctrl *ItemController) CreateNewItemHandler(c *gin.Context) {
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

	var req ItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = service.CreateNewItem(service.ItemInput{
		UserID:     userID,
		Name:       req.Name,
		Type:       req.Type,
		Amount:     req.Amount,
		AmountType: req.AmountType,
		Desc:       req.Desc,
		StartDate:  req.StartDate,
		ExpDate:    req.ExpDate,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Trigger recipe generation in the background
	go func() {
		if err := ctrl.recipeService.GenerateAndSaveRecipes(userID); err != nil {
			log.Printf("Error generating recipes for user %s: %v", userID, err)
		}
	}()

	c.JSON(http.StatusCreated, gin.H{"message": "Item created successfully"})
}

func (ctrl *ItemController) UpdateItemHandler(c *gin.Context) {
	var req ItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format"})
		return
	}

	expDate, err := time.Parse("2006-01-02", req.ExpDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expiration date format"})
		return
	}

	id, err := uuid.Parse(req.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	item := schema.Item{
		BaseModel:  schema.BaseModel{ID: id},
		Name:       req.Name,
		Type:       req.Type,
		Amount:     req.Amount,
		AmountType: req.AmountType,
		Desc:       &req.Desc,
		StartDate:  startDate,
		ExpDate:    expDate,
	}

	err = service.UpdateItem(item)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item updated successfully"})
}

func (ctrl *ItemController) DeleteItemHandler(c *gin.Context) {
	itemID := c.Param("id")
	err := service.DeleteItem(itemID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item deleted successfully"})
}