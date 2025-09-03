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

// GenerateAndSaveRecipes generates recipes based on various user data and saves them to the DB.
func (s *RecipeService) GenerateAndSaveRecipes(userID uuid.UUID) error {
	// 1. Get user's fresh items
	items, err := repository.GetAllFreshItem(userID.String())
	if err != nil {
		return fmt.Errorf("failed to get user items: %w", err)
	}
	if len(items) == 0 {
		// No items, no recipes to generate. Clear existing ones.
		return repository.UpsertGeneratedRecipes(userID, []schema.RecipeDetail{})
	}

	// 2. Get user's preferences (includes onboarding data and tags)
	userPref, err := repository.GetUserPreference(userID)
	if err != nil {
		return fmt.Errorf("failed to get user preferences: %w", err)
	}

	// 3. Get user's daily nutrition summary
	todayJournals, err := repository.GetTodayFoodJournalByUserID(userID.String())
	if err != nil {
		fmt.Printf("Could not get nutrition summary for user %s: %v\n", userID, err)
	}

	var todayNutrition schema.AINutrition
	for _, journal := range todayJournals {
		todayNutrition.Calories += journal.AINutrition.Calories
		todayNutrition.Protein += journal.AINutrition.Protein
		todayNutrition.Carbs += journal.AINutrition.Carbs
		todayNutrition.Fat += journal.AINutrition.Fat
		todayNutrition.Sugar += journal.AINutrition.Sugar
		todayNutrition.Fiber += journal.AINutrition.Fiber
		todayNutrition.Sodium += journal.AINutrition.Sodium
	}

	// 4. Create prompt for Gemini
	prompt := s.createRecipePrompt(items, userPref, &todayNutrition)

	// 5. Call Gemini service
	response, err := s.geminiService.GenerateContent(prompt)
	if err != nil {
		return fmt.Errorf("failed to generate content from Gemini: %w", err)
	}

	// 6. Clean and unmarshal the response
	cleanedJSON := utils.CleanGeminiResponse(response)
	var recipes []schema.RecipeDetail
	if err := json.Unmarshal([]byte(cleanedJSON), &recipes); err != nil {
		fmt.Printf("Failed to unmarshal JSON for user %s: %s\n", userID, err)
		fmt.Printf("Cleaned JSON string: %s\n", cleanedJSON)
		return fmt.Errorf("failed to unmarshal recipes response: %w", err)
	}

	// 7. Save recipes to the database
	if err := repository.UpsertGeneratedRecipes(userID, recipes); err != nil {
		return fmt.Errorf("failed to save generated recipes: %w", err)
	}

	return nil
}

func (s *RecipeService) createRecipePrompt(items []schema.Item, pref *schema.UserPreference, nutrition *schema.AINutrition) string {
	var itemNames []string
	for _, item := range items {
		itemNames = append(itemNames, item.Name)
	}
	itemsStr := strings.Join(itemNames, ", ")

	var tagNames []string
	for _, tag := range pref.PreferredTags {
		tagNames = append(tagNames, tag.Tag)
	}
	tagsStr := strings.Join(tagNames, ", ")
	if tagsStr == "" {
		tagsStr = "tidak ada preferensi spesifik"
	}

	// Basic daily needs (can be made more dynamic later)
	targetCalories := 2000.0
	targetProtein := 50.0
	targetCarbs := 250.0
	targetFat := 70.0

	nutritionNeedsStr := fmt.Sprintf(
		"Sisa kebutuhan gizi hari ini: Kalori: %.0f kcal, Protein: %.0f g, Karbohidrat: %.0f g, Lemak: %.0f g.",
		targetCalories-nutrition.Calories,
		targetProtein-nutrition.Protein,
		targetCarbs-nutrition.Carbs,
		targetFat-nutrition.Fat,
	)

	prompt := fmt.Sprintf(`
	Anda adalah seorang ahli gizi dan koki. Buatkan 8 rekomendasi resep masakan yang dipersonalisasi untuk pengguna dengan informasi berikut:

	1.  **Bahan Tersedia di Kulkas**: %s
	2.  **Preferensi Rasa/Masakan (Tags)**: %s
	3.  **Kebutuhan Gizi Hari Ini**: %s
	4.  **Info Pengguna**: Usia: %d, Target Kesehatan: %s, Aktivitas: %s

	**Tugas Anda:**
	Buat resep yang memaksimalkan penggunaan **Bahan Tersedia**.
	Sesuaikan resep dengan **Preferensi Rasa/Masakan**.
	Prioritaskan resep yang membantu memenuhi **Kebutuhan Gizi Hari Ini**.
	Pertimbangkan **Info Pengguna** untuk membuat resep yang relevan dan sehat.

	**PENTING: Berikan respons HANYA dalam format array JSON yang valid dan bisa di-parse. Jangan tambahkan teks atau markdown lain di luar array JSON.**
	Struktur JSON harus sama persis dengan contoh di bawah ini, termasuk semua nama field dan tipe datanya.

	Contoh struktur JSON:
	[
	  {
	    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
	    "title": "Contoh Judul Resep",
	    "slug": "contoh-judul-resep",
	    "description": "Deskripsi singkat dan menarik tentang resep ini.",
		"health_analysis": "Analisis mengapa resep ini baik untuk pengguna berdasarkan data onboarding dan kebutuhan gizi mereka. Jelaskan secara singkat dan jelas.",
	    "rating": 4.7,
	    "cooking_time": 25,
	    "serving_min": 2,
	    "serving_max": 4,
	    "release_date": 1678886400,
	    "author": {
	      "name": "KulkasKu AI Chef"
	    },
	    "tags": [
	      { "name": "Sehat" },
	      { "name": "Cepat" }
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
	          { "description": "200 gr dada ayam, potong dadu" }
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
	`, itemsStr, tagsStr, nutritionNeedsStr, pref.Age, pref.HealthTarget, pref.DailyActivity)

	return prompt
}
