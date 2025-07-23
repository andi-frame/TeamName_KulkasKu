package controller

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
)

type ProductController struct {
	productService service.ProductService
}

func NewProductController(productService service.ProductService) *ProductController {
	return &ProductController{
		productService: productService,
	}
}

func (pc *ProductController) GetProductInfoByBarcodeHandler(ctx *gin.Context) {
	barcode := ctx.Param("barcode")
	
	if barcode == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Barcode tidak boleh kosong",
		})
		return
	}

	fmt.Printf("Menerima permintaan untuk barcode: %s\n", barcode)

	productInfo, err := pc.productService.GetProductByBarcode(barcode)
	if err != nil {
		fmt.Printf("Error mendapatkan produk: %v\n", err)
		ctx.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Produk tidak ditemukan",
		})
		return
	}

	fmt.Printf("Produk ditemukan: %s\n", productInfo.Name)

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"name": productInfo.Name,
			"barcode": barcode,
		},
	})
}

func (pc *ProductController) HealthCheckHandler(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"success":   true,
		"message":   "Product service is running",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}