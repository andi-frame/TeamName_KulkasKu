package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"time"
)

type ReceiptService interface {
	AnalyzeReceipt(imageData []byte) (*ReceiptResult, error)
}

type ReceiptResult struct {
	Items          []ReceiptItem `json:"items"`
	Confidence     float64       `json:"confidence"`
	ProcessingTime string        `json:"processing_time"`
}

type ReceiptItem struct {
	Name       string  `json:"name"`
	Quantity   int     `json:"quantity,omitempty"`
	Price      float64 `json:"price,omitempty"`
	Confidence float64 `json:"confidence"`
}

type receiptService struct {
	pythonServiceURL string
	httpClient       *http.Client
}

type PythonReceiptResponse struct {
	Success bool `json:"success"`
	Data    struct {
		Items          []ReceiptItem `json:"items"`
		Confidence     float64       `json:"confidence"`
		ProcessingTime string        `json:"processing_time"`
	} `json:"data"`
	Error string `json:"error,omitempty"`
}

func NewReceiptService(pythonServiceURL string) ReceiptService {
	return &receiptService{
		pythonServiceURL: pythonServiceURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (rs *receiptService) AnalyzeReceipt(imageData []byte) (*ReceiptResult, error) {
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	h := make(textproto.MIMEHeader)
	h.Set("Content-Disposition", `form-data; name="file"; filename="receipt.jpg"`)
	h.Set("Content-Type", "image/jpeg")
	part, err := writer.CreatePart(h)
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}

	if _, err := part.Write(imageData); err != nil {
		return nil, fmt.Errorf("failed to write image data: %w", err)
	}

	// Tutup writer
	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("failed to close multipart writer: %w", err)
	}

	// Buat HTTP request ke Python service
	url := fmt.Sprintf("%s/analyze-receipt", rs.pythonServiceURL)
	req, err := http.NewRequest("POST", url, &buf)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	// Kirim request
	resp, err := rs.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request to Python service: %w", err)
	}
	defer resp.Body.Close()

	// Parse response
	var pythonResp PythonReceiptResponse
	if err := json.NewDecoder(resp.Body).Decode(&pythonResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Periksa apakah request berhasil
	if !pythonResp.Success {
		return nil, fmt.Errorf("python service error: %s", pythonResp.Error)
	}

	// Konversi ke format yang diharapkan
	result := &ReceiptResult{
		Items:          pythonResp.Data.Items,
		Confidence:     pythonResp.Data.Confidence,
		ProcessingTime: pythonResp.Data.ProcessingTime,
	}

	return result, nil
}
