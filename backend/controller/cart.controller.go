package controller

import (
	"net/http"

	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var cartService = service.CartService{}

func CreateNewCartHandler(c *gin.Context) {
	user, _ := c.Get("user")
	userData := user.(middleware.JWTUserData)
	userID, _ := uuid.Parse(userData.ID)

	var cart schema.Cart
	if err := c.ShouldBindJSON(&cart); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cart.UserID = userID

	if err := cartService.CreateCart(&cart); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cart"})
		return
	}
	c.JSON(http.StatusCreated, cart)
}

func GetAllCartHandler(c *gin.Context) {
	user, _ := c.Get("user")
	userData := user.(middleware.JWTUserData)
	userID, _ := uuid.Parse(userData.ID)

	carts, err := cartService.GetAllCartsByUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch carts"})
		return
	}
	c.JSON(http.StatusOK, carts)
}

func GetCartDetailHandler(c *gin.Context) {
	cartIDStr := c.Query("id")
	cartID, err := uuid.Parse(cartIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cart ID"})
		return
	}
	cart, err := cartService.GetCartDetail(cartID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart not found"})
		return
	}
	c.JSON(http.StatusOK, cart)
}

func UpdateCartHandler(c *gin.Context) {
	var cart schema.Cart
	if err := c.ShouldBindJSON(&cart); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := cartService.UpdateCart(&cart); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cart updated"})
}

func DeleteCartHandler(c *gin.Context) {
	cartIDStr := c.Param("id")
	cartID, err := uuid.Parse(cartIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cart ID"})
		return
	}
	if err := cartService.DeleteCart(cartID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete cart"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cart deleted"})
}
