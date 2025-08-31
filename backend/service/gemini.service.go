package service

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/andi-frame/TeamName_KulkasKu/backend/utils"
)

type GeminiService struct {
	apiKey     string
	httpClient *http.Client
}

func NewGeminiService() (*GeminiService, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY not found in environment variables")
	}

	return &GeminiService{
		apiKey:     apiKey,
		httpClient: &http.Client{},
	}, nil
}

func (s *GeminiService) PredictItem(file multipart.File, header *multipart.FileHeader) (*schema.PredictResponse, error) {
	imgBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read image file: %w", err)
	}

	imgBase64 := base64.StdEncoding.EncodeToString(imgBytes)

	reqBody := &geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{
						Text: createPrompt(),
					},
					{
						InlineData: &geminiInlineData{
							MimeType: header.Header.Get("Content-Type"),
							Data:     imgBase64,
						},
					},
				},
			},
		},
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequest("POST", "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+s.apiKey, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
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
	jsonString := geminiResp.Candidates[0].Content.Parts[0].Text

	cleanedJSON := utils.CleanGeminiResponse(jsonString)

	var predictResp schema.PredictResponse
	if err := json.Unmarshal([]byte(cleanedJSON), &predictResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal prediction response: %w", err)
	}

	return &predictResp, nil
}

func (s *GeminiService) GenerateContent(prompt string) (string, error) {
	reqBody := &geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{Text: prompt},
				},
			},
		},
		GenerationConfig: &geminiGenerationConfig{
			ResponseMIMEType: "application/json",
		},
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequest("POST", "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+s.apiKey, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request to Gemini API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Gemini API returned non-200 status code: %d %s", resp.StatusCode, string(body))
	}

	var geminiResp geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return "", fmt.Errorf("failed to decode Gemini API response: %w", err)
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("unexpected Gemini API response format")
	}

	return geminiResp.Candidates[0].Content.Parts[0].Text, nil
}

func createPrompt() string {
	return "Analisis gambar makanan ini dengan detail dan berikan respons dalam format JSON dengan struktur berikut:\n\n{\"item_name\": \"nama makanan/bahan makanan utama\",\"condition_description\": \"deskripsi kondisi makanan (segar, layu, busuk, dll)\",\"predicted_remaining_days\": angka hari (integer) prediksi daya tahan,\"reasoning\": \"penjelasan detail mengapa AI memberikan prediksi tersebut berdasarkan visual yang terlihat\",\"confidence\": nilai kepercayaan 0-1 (float)}\n\nPertimbangkan faktor-faktor berikut dalam analisis:\n- Warna dan tekstur makanan\n- Tanda-tanda kesegaran atau pembusukan\n- Jenis makanan dan daya tahan umumnya\n- Kondisi penyimpanan yang terlihat\n\nUntuk predicted_remaining_days, berikan estimasi berapa hari lagi makanan ini akan aman dikonsumsi.\nUntuk reasoning, berikan penjelasan yang mudah dipahami tentang mengapa prediksi tersebut diberikan.\n\nBerikan prediksi yang realistis dan konservatif untuk keamanan makanan.\nRespons harus dalam bahasa Indonesia untuk deskripsi dan reasoning."
}

type geminiGenerationConfig struct {
	ResponseMIMEType string `json:"response_mime_type"`
}

type geminiRequest struct {
	Contents         []geminiContent         `json:"contents"`
	GenerationConfig *geminiGenerationConfig `json:"generation_config,omitempty"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text       string            `json:"text,omitempty"`
	InlineData *geminiInlineData `json:"inline_data,omitempty"`
}

type geminiInlineData struct {
	MimeType string `json:"mime_type"`
	Data     string `json:"data"`
}

type geminiResponse struct {
	Candidates []geminiCandidate `json:"candidates"`
}

type geminiCandidate struct {
	Content geminiContent `json:"content"`
}
