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
	"strings"

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
						Text: createItemPredictionPrompt(),
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

func (s *GeminiService) AnalyzeText(prompt string) (string, error) {
	reqBody := &geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{
						Text: prompt,
					},
				},
			},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request body: %w", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=%s", s.apiKey)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to call Gemini API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Gemini API returned status %d: %s", resp.StatusCode, string(bodyBytes))
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

func (s *GeminiService) AnalyzeFoodFromText(description string) (*schema.FoodAnalysis, error) {
	prompt := createFoodAnalysisPrompt(description, "text")

	response, err := s.GenerateContent(prompt)
	if err != nil {
		return nil, fmt.Errorf("failed to analyze food text: %w", err)
	}
	cleanedJSON := utils.CleanGeminiResponse(response)

	var foodAnalysis schema.FoodAnalysis
	if err := json.Unmarshal([]byte(cleanedJSON), &foodAnalysis); err != nil {
		return nil, fmt.Errorf("failed to unmarshal food analysis response: %w\nRaw response: %s\nCleaned: %s", err, response, cleanedJSON)
	}

	return &foodAnalysis, nil
}

func (s *GeminiService) AnalyzeFoodFromImage(file multipart.File, header *multipart.FileHeader) (*schema.FoodAnalysis, error) {
	imgBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read image file: %w", err)
	}

	imgBase64 := base64.StdEncoding.EncodeToString(imgBytes)
	prompt := createFoodAnalysisPrompt("", "image")

	reqBody := &geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{
						Text: prompt,
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
		GenerationConfig: &geminiGenerationConfig{
			ResponseMIMEType: "application/json",
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
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Gemini API returned non-200 status code: %d %s", resp.StatusCode, string(body))
	}

	var geminiResp geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return nil, fmt.Errorf("failed to decode Gemini API response: %w", err)
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("unexpected Gemini API response format")
	}

	responseText := geminiResp.Candidates[0].Content.Parts[0].Text
	cleanedJSON := utils.CleanGeminiResponse(responseText)

	var foodAnalysis schema.FoodAnalysis
	if err := json.Unmarshal([]byte(cleanedJSON), &foodAnalysis); err != nil {
		return nil, fmt.Errorf("failed to unmarshal food analysis response: %w", err)
	}

	return &foodAnalysis, nil
}

func (s *GeminiService) GenerateRecommendations(foodAnalysis *schema.FoodAnalysis, mealType string, feelingBefore string, feelingAfter string) (*schema.AIRecommendations, error) {
	prompt := createRecommendationPrompt(foodAnalysis, mealType, feelingBefore, feelingAfter)

	response, err := s.GenerateContent(prompt)
	if err != nil {
		return nil, fmt.Errorf("failed to generate recommendations: %w", err)
	}

	cleanedJSON := utils.CleanGeminiResponse(response)

	var recommendations schema.AIRecommendations
	if err := json.Unmarshal([]byte(cleanedJSON), &recommendations); err != nil {
		return nil, fmt.Errorf("failed to unmarshal recommendations response: %w", err)
	}

	return &recommendations, nil
}

func createItemPredictionPrompt() string {
	return "Analisis gambar makanan ini dengan detail dan berikan respons dalam format JSON dengan struktur berikut:\n\n{\"item_name\": \"nama makanan/bahan makanan utama\",\"condition_description\": \"deskripsi kondisi makanan (segar, layu, busuk, dll)\",\"predicted_remaining_days\": angka hari (integer) prediksi daya tahan,\"reasoning\": \"penjelasan detail mengapa AI memberikan prediksi tersebut berdasarkan visual yang terlihat\",\"confidence\": nilai kepercayaan 0-1 (float)}\n\nPertimbangkan faktor-faktor berikut dalam analisis:\n- Warna dan tekstur makanan\n- Tanda-tanda kesegaran atau pembusukan\n- Jenis makanan dan daya tahan umumnya\n- Kondisi penyimpanan yang terlihat\n\nUntuk predicted_remaining_days, berikan estimasi berapa hari lagi makanan ini akan aman dikonsumsi.\nUntuk reasoning, berikan penjelasan yang mudah dipahami tentang mengapa prediksi tersebut diberikan.\n\nBerikan prediksi yang realistis dan konservatif untuk keamanan makanan.\nRespons harus dalam bahasa Indonesia untuk deskripsi dan reasoning."
}

func createFoodAnalysisPrompt(input string, inputType string) string {
	basePrompt := `Analisis makanan dan berikan respons dalam format JSON yang valid dengan struktur berikut:

{
  "detected_foods": [
    {
      "name": "nama makanan",
      "portion": "ukuran porsi (contoh: 1 porsi, 100 gram, 1 buah sedang)",
      "weight": angka berat dalam gram (float),
      "nutrition": {
        "calories": angka kalori (float),
        "protein": angka protein dalam gram (float),
        "carbs": angka karbohidrat dalam gram (float),
        "fat": angka lemak dalam gram (float),
        "sugar": angka gula dalam gram (float),
        "fiber": angka serat dalam gram (float),
        "sodium": angka sodium dalam mg (float),
        "confidence": tingkat kepercayaan 0-1 (float)
      },
      "description": "deskripsi detail makanan dan cara penyajiannya"
    }
  ],
  "total_nutrition": {
    "calories": total kalori dari semua makanan (float),
    "protein": total protein dalam gram (float),
    "carbs": total karbohidrat dalam gram (float),
    "fat": total lemak dalam gram (float),
    "sugar": total gula dalam gram (float),
    "fiber": total serat dalam gram (float),
    "sodium": total sodium dalam mg (float),
    "confidence": rata-rata kepercayaan 0-1 (float)
  },
  "analysis_text": "rangkuman analisis dan insight nutrisi",
  "confidence": tingkat kepercayaan keseluruhan 0-1 (float)
}

PENTING: 
- Pastikan response adalah JSON yang valid
- Tidak ada koma tambahan di akhir array atau object
- Semua field wajib diisi dengan nilai yang sesuai
- Gunakan float untuk semua nilai numerik
- Deskripsi dalam bahasa Indonesia yang natural

Petunjuk analisis:
- Identifikasi semua makanan yang disebutkan/terlihat
- Berikan takaran normal untuk satu porsi jika tidak disebutkan spesifik
- Hitung nilai gizi berdasarkan database nutrisi standar
- Untuk input text yang tidak spesifik takaran, gunakan ukuran porsi normal
- Berikan analisis yang realistis dan akurat`

	switch inputType {
	case "text":
		return fmt.Sprintf("%s\n\nDeskripsi makanan: %s", basePrompt, input)
	case "image":
		return fmt.Sprintf("%s\n\nAnalisis gambar makanan yang diberikan.", basePrompt)
	default:
		return fmt.Sprintf("%s\n\nInput: %s", basePrompt, input)
	}
}

func createRecommendationPrompt(foodAnalysis *schema.FoodAnalysis, mealType string, feelingBefore string, feelingAfter string) string {
	var nutritionInfo string
	var foodInfo string

	if foodAnalysis != nil {
		nutritionInfo = fmt.Sprintf(`
Informasi Nutrisi Makanan:
- Kalori: %.1f kcal
- Protein: %.1f gram
- Karbohidrat: %.1f gram
- Lemak: %.1f gram
- Gula: %.1f gram
- Serat: %.1f gram
- Sodium: %.1f mg`,
			foodAnalysis.TotalNutrition.Calories,
			foodAnalysis.TotalNutrition.Protein,
			foodAnalysis.TotalNutrition.Carbs,
			foodAnalysis.TotalNutrition.Fat,
			foodAnalysis.TotalNutrition.Sugar,
			foodAnalysis.TotalNutrition.Fiber,
			foodAnalysis.TotalNutrition.Sodium,
		)

		var foods []string
		for _, food := range foodAnalysis.DetectedFoods {
			foods = append(foods, fmt.Sprintf("%s (%s)", food.Name, food.Portion))
		}
		foodInfo = fmt.Sprintf("Makanan yang dikonsumsi: %s", strings.Join(foods, ", "))
	}

	prompt := fmt.Sprintf(`Berdasarkan data konsumsi makanan berikut, berikan rekomendasi personal dalam format JSON:

%s
%s

Konteks Tambahan:
- Jenis makanan: %s
- Perasaan sebelum makan: %s
- Perasaan setelah makan: %s

Berikan respons dalam format JSON dengan struktur berikut:
{
  "next_meal_suggestion": "saran makanan untuk makan selanjutnya yang melengkapi nutrisi yang sudah dikonsumsi",
  "nutrition_tips": "tips nutrisi berdasarkan pola makan saat ini",
  "motivational_message": "pesan motivasi yang personal dan mendukung"
}

Panduan untuk setiap field:
1. next_meal_suggestion: Rekomendasikan makanan yang dapat melengkapi nutrisi yang kurang atau menyeimbangkan yang berlebih. Pertimbangkan waktu makan (sarapan/makan siang/makan malam) dan kebutuhan nutrisi harian.

2. nutrition_tips: Berikan tips praktis tentang:
   - Keseimbangan nutrisi berdasarkan konsumsi saat ini
   - Saran waktu makan yang tepat
   - Tips untuk meningkatkan kualitas nutrisi
   - Peringatan jika ada nutrisi yang berlebihan

3. motivational_message: Berikan motivasi yang:
   - Mengapresiasi kebiasaan baik yang sudah dilakukan
   - Memberikan semangat untuk terus menjaga pola makan sehat
   - Personal berdasarkan perasaan sebelum dan sesudah makan
   - Positif dan mendukung perjalanan kesehatan

Semua respons harus dalam bahasa Indonesia yang ramah dan mudah dipahami. Buat saran yang realistis dan dapat diterapkan dalam kehidupan sehari-hari.`,
		foodInfo,
		nutritionInfo,
		mealType,
		feelingBefore,
		feelingAfter,
	)

	return prompt
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
