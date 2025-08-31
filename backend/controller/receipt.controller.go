package controller

import (
	"net/http"

	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
	"github.com/gin-gonic/gin"
)

type ReceiptController struct {
	receiptService *service.ReceiptService
}

func NewReceiptController(receiptService *service.ReceiptService) *ReceiptController {
	return &ReceiptController{
		receiptService: receiptService,
	}
}

func (rc *ReceiptController) AnalyzeReceiptHandler(ctx *gin.Context) {
	// 1. Dapatkan file gambar dari request
	file, header, err := ctx.Request.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "File gambar tidak ditemukan atau format tidak valid",
		})
		return
	}
	defer file.Close()

	// 2. Panggil service untuk melakukan analisis
	result, err := rc.receiptService.AnalyzeReceipt(file, header)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal melakukan analisis struk: " + err.Error(),
		})
		return
	}

	// 3. Return the result
	ctx.JSON(http.StatusOK, result)
}