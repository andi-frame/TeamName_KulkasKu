package service

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"

	"github.com/andi-frame/TeamName_KulkasKu/backend/constants"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/andi-frame/TeamName_KulkasKu/backend/utils"
)

type ReceiptService struct {
	geminiService *GeminiService
}

func NewReceiptService(geminiService *GeminiService) (*ReceiptService, error) {
	return &ReceiptService{
		geminiService: geminiService,
	}, nil
}

func (s *ReceiptService) AnalyzeReceipt(file multipart.File, header *multipart.FileHeader) (*schema.ReceiptAnalysisResponse, error) {
	imgBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read image file: %w", err)
	}

	imgBase64 := base64.StdEncoding.EncodeToString(imgBytes)

	reqBody := &geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{Text: s.createReceiptPrompt()},
					{InlineData: &geminiInlineData{
						MimeType: header.Header.Get("Content-Type"),
						Data:     imgBase64,
					}},
				},
			},
		},
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	url := fmt.Sprintf("%s/models/%s:generateContent?key=%s", constants.GeminiAPIBaseURL, constants.GeminiModel, s.geminiService.apiKey)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set(constants.ContentTypeHeader, constants.ApplicationJSON)

	resp, err := s.geminiService.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request to Gemini API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Gemini API returned non-200 status code: %d", resp.StatusCode)
	}

	var geminiResp geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return nil, fmt.Errorf("failed to decode Gemini API response: %w", err)
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("unexpected Gemini API response format")
	}

	responseText := geminiResp.Candidates[0].Content.Parts[0].Text
	cleanedText := utils.CleanGeminiResponse(responseText)

	var geminiReceiptData struct {
		Items      []schema.ReceiptItem `json:"items"`
		Confidence float64              `json:"confidence"`
	}
	if err := json.Unmarshal([]byte(cleanedText), &geminiReceiptData); err != nil {
		return nil, fmt.Errorf("failed to unmarshal receipt response: %w", err)
	}

	return &schema.ReceiptAnalysisResponse{
		Success: true,
		Data: &schema.ReceiptData{
			Items:      geminiReceiptData.Items,
			Confidence: geminiReceiptData.Confidence,
		},
	}, nil
}

func (s *ReceiptService) createReceiptPrompt() string {
	return `Analisis struk belanja dalam gambar ini dan ekstrak semua item yang dibeli. 
Berikan respons dalam format JSON dengan struktur berikut:

{
    "items": [
        {
            "name": "nama item",
            "quantity": jumlah (integer),
            "price": harga satuan (float),
            "confidence": nilai kepercayaan 0-1 (float)
        }
    ],
    "confidence": nilai kepercayaan keseluruhan 0-1 (float)
}

Petunjuk analisis:
- Fokus pada item-item yang dibeli (produk/barang)
- Abaikan informasi toko, tanggal, waktu, total, pajak, dan kembalian
- Ekstrak nama item, jumlah, dan harga jika tersedia
- Berikan confidence score berdasarkan kejelasan teks
- Gunakan bahasa Indonesia untuk nama item
- Hindari duplikasi item yang sama
- Jika tidak ada quantity yang terdeteksi, gunakan 1 sebagai default
- Jika tidak ada harga yang terdeteksi, gunakan 0.0 sebagai default`
}
