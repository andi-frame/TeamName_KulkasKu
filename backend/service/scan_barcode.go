package service

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type ProductService interface {
	GetProductByBarcode(barcode string) (*ProductInfo, error)
}

type ProductInfo struct {
	Name string `json:"name"`
}

type productService struct {
	httpClient *http.Client
}

type OpenFoodFactsResponse struct {
	Product *OpenFoodFactsProduct `json:"product"`
}

type OpenFoodFactsProduct struct {
	Brands string `json:"brands"`
}

func NewProductService() ProductService {
	return &productService{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (ps *productService) GetProductByBarcode(barcode string) (*ProductInfo, error) {
	url := fmt.Sprintf("https://world.openfoodfacts.org/api/v2/product/%s.json", barcode)
	
	resp, err := ps.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to call Open Food Facts API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Open Food Facts API returned status code: %d", resp.StatusCode)
	}

	var openFoodFactsResp OpenFoodFactsResponse
	if err := json.NewDecoder(resp.Body).Decode(&openFoodFactsResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if openFoodFactsResp.Product == nil || openFoodFactsResp.Product.Brands == "" {
		return nil, fmt.Errorf("product not found in Open Food Facts")
	}

	productInfo := &ProductInfo{
		Name: openFoodFactsResp.Product.Brands,
	}

	if productInfo.Name == "" {
		productInfo.Name = "Nama tidak tersedia"
	}

	return productInfo, nil
}