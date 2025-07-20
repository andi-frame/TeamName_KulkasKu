package controller

import (
	"io"
	"net/http"
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
	"github.com/gin-gonic/gin"
)

type ReceiptController struct {
	receiptService service.ReceiptService
}

func NewReceiptController(receiptService service.ReceiptService) *ReceiptController {
	return &ReceiptController{
		receiptService: receiptService,
	}
}

func (rc *ReceiptController) ScanReceiptHandler(ctx *gin.Context) {
	file, header, err := ctx.Request.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "File gambar tidak ditemukan atau format tidak valid",
		})
		return
	}
	defer file.Close()

	if !isValidImageType(header.Filename) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Format file tidak didukung. Hanya JPG, JPEG, PNG yang diizinkan.",
		})
		return
	}

	if header.Size > 10*1024*1024 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Ukuran file terlalu besar. Maksimal 10MB",
		})
		return
	}

	imageData, err := io.ReadAll(file)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal membaca file gambar",
		})
		return
	}

	receiptResult, err := rc.receiptService.AnalyzeReceipt(imageData)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal menganalisis struk: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"items":           receiptResult.Items,
			"total_items":     len(receiptResult.Items),
			"confidence":      receiptResult.Confidence,
			"processing_time": receiptResult.ProcessingTime,
		},
	})
}

func (rc *ReceiptController) HealthCheckHandler(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"success":   true,
		"message":   "Receipt service is running",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
