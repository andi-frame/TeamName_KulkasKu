package controller

import (
	"net/http"
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/database"
	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var cartService = service.CartService{}

type CreateCartItemRequest struct {
	CartID     uuid.UUID `json:"CartID"`
	Name       string    `json:"Name"`
	Type       string    `json:"Type"`
	Amount     float64   `json:"Amount"`
	AmountType string    `json:"AmountType"`
	Desc       *string   `json:"Desc"`
}

func CreateCartItemHandler(c *gin.Context) {
	var req CreateCartItemRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	cartItem := schema.CartItem{
		BaseModel:  schema.BaseModel{ID: uuid.New()},
		CartID:     req.CartID,
		Name:       req.Name,
		Type:       req.Type,
		Amount:     req.Amount,
		AmountType: req.AmountType,
		Desc:       req.Desc,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := database.DB.Create(&cartItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cart item"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Cart item created", "cartItem": cartItem})
}

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
	cartIDStr := c.Param("id")
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

func GetCartItemsHandler(c *gin.Context) {
	cartIDParam := c.Param("id")
	cartID, err := uuid.Parse(cartIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cart ID"})
		return
	}

	var cartItems []schema.CartItem
	if err := database.DB.
		Where("cart_id = ?", cartID).
		Find(&cartItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart items"})
		return
	}

	c.JSON(http.StatusOK, cartItems)
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
