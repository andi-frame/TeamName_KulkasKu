package service

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/andi-frame/TeamName_KulkasKu/backend/utils"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RecipeService struct {
	geminiService *GeminiService
	db            *gorm.DB
}

func NewRecipeService(geminiService *GeminiService, db *gorm.DB) *RecipeService {
	return &RecipeService{
		geminiService: geminiService,
		db:            db,
	}
}

func (s *RecipeService) GenerateRecipes(userID uuid.UUID) ([]schema.RecipeDetail, error) {
	// 1. Get user's fresh items
	items, err := repository.GetAllFreshItem(userID.String())
	if err != nil {
		return nil, fmt.Errorf("failed to get user items: %w", err)
	}

	// 2. Get user's onboarding preferences
	var userPref schema.UserPreference
	if err := s.db.Where("user_id = ?", userID).First(&userPref).Error; err != nil {
		return nil, fmt.Errorf("failed to get user preferences: %w", err)
	}

	// 3. Create prompt for Gemini
	prompt := s.createRecipePrompt(items, &userPref)

	// 4. Call Gemini service
	response, err := s.geminiService.GenerateContent(prompt)
	if err != nil {
		return nil, fmt.Errorf("failed to generate content from Gemini: %w", err)
	}

	// 5. Clean and unmarshal the response
	cleanedJSON := utils.CleanGeminiResponse(response)

	var recipes []schema.RecipeDetail
	if err := json.Unmarshal([]byte(cleanedJSON), &recipes); err != nil {
		fmt.Printf("Failed to unmarshal JSON: %s\n", err)
		fmt.Printf("Cleaned JSON string: %s\n", cleanedJSON)
		return nil, fmt.Errorf("failed to unmarshal recipes response: %w", err)
	}

	return recipes, nil
}

func (s *RecipeService) createRecipePrompt(items []schema.Item, pref *schema.UserPreference) string {
	var itemNames []string
	for _, item := range items {
		itemNames = append(itemNames, item.Name)
	}
	itemsStr := strings.Join(itemNames, ", ")

	prompt := fmt.Sprintf(`
	Anda adalah seorang ahli gizi dan koki. Buatkan 5 rekomendasi resep masakan untuk pengguna dengan informasi berikut:
	- Bahan Tersedia: %s
	- Usia: %d
	- Target Kesehatan: %s
	- Kondisi Medis: Gula Darah %d, Kolesterol %d, Tekanan Darah %s
	- Aktivitas: %s

	PENTING: Berikan respons HANYA dalam format array JSON yang valid. Jangan tambahkan teks atau markdown lain.
	Struktur JSON harus sama persis dengan contoh di bawah ini, termasuk semua nama field dan tipe datanya.

	Contoh struktur JSON:
	[
	  {
	    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
	    "title": "Contoh Judul Resep",
	    "slug": "contoh-judul-resep",
	    "description": "Deskripsi singkat dan menarik tentang resep ini.",
		"health_analysis": "Analisis mengapa resep ini baik untuk pengguna berdasarkan data onboarding mereka. Jelaskan secara singkat dan jelas.",
	    "rating": 4.7,
	    "cooking_time": 25,
	    "serving_min": 2,
	    "serving_max": 4,
	    "release_date": 1678886400,
	    "author": {
	      "name": "KulkasKu AI Chef"
	    },
	    "tags": [
	      {
	        "name": "Sehat"
	      }
	    ],
		"nutrition": [
		  {"name": "Kalori", "amount": "350", "unit": "kcal"},
		  {"name": "Protein", "amount": "30", "unit": "g"},
		  {"name": "Lemak", "amount": "15", "unit": "g"},
		  {"name": "Karbohidrat", "amount": "25", "unit": "g"}
		],
	    "ingredient_type": [
	      {
	        "name": "Bahan Utama",
	        "ingredients": [
	          {
	            "description": "200 gr dada ayam, potong dadu"
	          }
	        ]
	      }
	    ],
	    "cooking_step": [
	      {
	        "order": 1,
	        "title": "Langkah 1: Tumis Bumbu",
	        "text": "Panaskan minyak, tumis bawang putih hingga harum."
	      }
	    ]
	  }
	]
	`, itemsStr, pref.Age, pref.HealthTarget, pref.BloodSugar, pref.Cholesterol, pref.BloodPressure, pref.DailyActivity)

	return prompt
}
