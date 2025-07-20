package controller

import (
	"github.com/gin-gonic/gin"

	"io"
	"net/http"
	"strings"
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
)

type PredictionController struct {
	predictionService service.AIPredictionService
}

func NewPredictionController(predictionService service.AIPredictionService) *PredictionController {
	return &PredictionController{
		predictionService: predictionService,
	}
}

func isValidImageType(filename string) bool {
	// Ambil ekstensi file dan ubah ke huruf kecil
	ext := strings.ToLower(filename[strings.LastIndex(filename, ".")+1:])
	validTypes := []string{"jpg", "jpeg", "png"}

	for _, validType := range validTypes {
		if ext == validType {
			return true
		}
	}
	return false
}

// Handler untuk endpoint prediksi item
func (pc *PredictionController) PredictItemHandler(ctx *gin.Context) {
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

	if !isValidImageType(header.Filename) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Format file tidak didukung. Hanya JPG, JPEG, PNG yang diizinkan.",
		})
		return
	}

	// Validasi ukuran file (maksimal 10MB)
	if header.Size > 10*1024*1024 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Ukuran file terlalu besar. Maksimal 10MB",
		})
		return
	}

	// Baca data gambar
	imageData, err := io.ReadAll(file)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal membaca file gambar",
		})
		return
	}

	// 2. Panggil service untuk melakukan prediksi
	aiResult, err := pc.predictionService.PredictItem(imageData)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal melakukan prediksi: " + err.Error(),
		})
		return
	}

	// 3. Return the AI result directly in the format expected by frontend
	ctx.JSON(http.StatusOK, gin.H{
		"item_name":                aiResult.ItemName,
		"condition_description":    aiResult.ConditionDescription,
		"predicted_remaining_days": aiResult.PredictedRemainingDays,
		"reasoning":                aiResult.Reasoning,
		"confidence":               aiResult.Confidence,
	})
}

// Handler untuk health check
func (pc *PredictionController) HealthCheckHandler(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"success":   true,
		"message":   "Service is running",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
