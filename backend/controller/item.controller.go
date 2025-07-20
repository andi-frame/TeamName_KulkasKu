package controller

import (
	"net/http"
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateItemRequest struct {
	NamaMakanan        string  `json:"namaMakanan"`
	Jumlah             float64 `json:"jumlah"`
	Satuan             string  `json:"satuan"`
	TanggalMasuk       string  `json:"tanggalMasuk"`       // format: yyyy-mm-dd
	TanggalKedaluwarsa string  `json:"tanggalKedaluwarsa"` // format: yyyy-mm-dd
	Deskripsi          string  `json:"deskripsi"`
}

func GetAllItemHandler(c *gin.Context) {
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

func CreateNewItemHandler(c *gin.Context) {
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

	var req CreateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	expDate, err := time.Parse("2006-01-02", req.TanggalKedaluwarsa)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expiration date format"})
		return
	}

	var amountType *string = nil
	if req.Satuan != "" {
		amountType = &req.Satuan
	}

	var desc *string = nil
	if req.Deskripsi != "" {
		desc = &req.Deskripsi
	}

	item := schema.Item{
		UserID:     userID,
		Name:       req.NamaMakanan,
		Amount:     req.Jumlah,
		Type:       req.Satuan,
		AmountType: amountType,
		Desc:       desc,
		ExpDate:    expDate,
	}

	if err := repository.CreateNewItem(item, userID.String()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create item"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Item created successfully"})
}
