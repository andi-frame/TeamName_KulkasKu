package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/andi-frame/TeamName_KulkasKu/backend/middleware"
	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
)

type FoodJournalRequest struct {
	ID             string `json:"id"`
	MealName       string `json:"meal_name"`
	MealType       string `json:"meal_type"`
	Description    string `json:"description"`
	FeelingBefore  string `json:"feeling_before"`
	FeelingAfter   string `json:"feeling_after"`
	InputType      string `json:"input_type"`
	RawInput       string `json:"raw_input"`
	ProcessedInput string `json:"processed_input"`
	ImageURL       string `json:"image_url"`
	FoodAnalysis   string `json:"food_analysis"`
	CreatedAt      string `json:"created_at"`
}

func formatFoodJournalResponse(journal schema.FoodJournal) gin.H {
	response := gin.H{
		"id":                 journal.ID,
		"created_at":         journal.CreatedAt,
		"meal_name":          journal.MealName,
		"meal_type":          journal.MealType,
		"description":        journal.Description,
		"feeling_before":     journal.FeelingBefore,
		"feeling_after":      journal.FeelingAfter,
		"input_type":         journal.InputType,
		"raw_input":          journal.RawInput,
		"processed_input":    journal.ProcessedInput,
		"image_url":          journal.ImageURL,
		"ai_nutrition":       journal.AINutrition,
		"ai_feedback":        journal.AIFeedback,
		"ai_recommendations": journal.AIRecommendations,
	}

	if journal.FoodAnalysis != "" {
		var foodAnalysis schema.FoodAnalysis
		if err := json.Unmarshal([]byte(journal.FoodAnalysis), &foodAnalysis); err == nil {
			response["food_analysis"] = foodAnalysis
		}
	}

	return response
}

func GetFoodJournalDashboardHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userData := user.(middleware.JWTUserData)

	todayJournals, err := repository.GetTodayFoodJournalByUserID(userData.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
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

	recentJournals, err := repository.GetRecentFoodJournalByUserID(userData.ID, 5)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var recentMeals []gin.H
	for _, journal := range recentJournals {
		recentMeals = append(recentMeals, gin.H{
			"id":           journal.ID,
			"meal_name":    journal.MealName,
			"meal_type":    journal.MealType,
			"created_at":   journal.CreatedAt,
			"ai_nutrition": journal.AINutrition,
		})
	}

	suggestions, err := generateAIMealSuggestions(userData.ID, todayNutrition, todayJournals)
	if err != nil {
		suggestions = generateBasicMealSuggestions(todayNutrition, todayJournals)
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"today_nutrition":       todayNutrition,
			"recent_meals":          recentMeals,
			"next_meal_suggestions": suggestions,
			"total_meals_today":     len(todayJournals),
		},
	})
}

func generateAIMealSuggestions(userID string, currentNutrition schema.AINutrition, todayMeals []schema.FoodJournal) ([]gin.H, error) {
	context := buildMealSuggestionContext(currentNutrition, todayMeals, userID)

	geminiService, err := service.NewGeminiService()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize AI service: %w", err)
	}

	prompt := fmt.Sprintf(`
		Berdasarkan data nutrisi dan makanan hari ini, berikan 4-5 saran menu makanan sehat yang spesifik:
		
		%s
		
		Berikan saran dalam format JSON dengan struktur:
		{
			"menu": "nama menu lengkap",
			"reason": "alasan mengapa menu ini disarankan"
		}
		
		Fokus pada:
		1. Nama menu makanan yang konkret dan realistis (bisa Indonesia, Asia, atau internasional)
		2. Alasan yang personal berdasarkan nutrisi yang kurang atau waktu makan yang belum diisi
		3. Sehat, bergizi seimbang, dan mudah ditemukan/dibuat
		4. Variasi jenis makanan (sarapan, makan utama, camilan sehat)
		
		Contoh format yang baik:
		- "Salad quinoa dengan ayam grilled dan alpukat"
		- "Smoothie bowl dengan buah-buahan dan granola"
		- "Sup miso dengan tahu dan sayuran"
		- "Pasta whole wheat dengan salmon dan brokoli"
		
		Format respons: berikan daftar menu yang mudah dipahami, satu per baris.
	`, context)

	analysis, err := geminiService.AnalyzeFoodFromText(prompt)
	if err != nil {
		return nil, fmt.Errorf("failed to generate AI suggestions: %w", err)
	}

	suggestions := parseEnhancedMealSuggestions(analysis.AnalysisText, currentNutrition, todayMeals)

	return suggestions, nil
}

func generateBasicMealSuggestions(currentNutrition schema.AINutrition, todayMeals []schema.FoodJournal) []gin.H {
	suggestions := []gin.H{}

	mealTypes := map[string]bool{
		"breakfast": false,
		"lunch":     false,
		"dinner":    false,
	}

	for _, meal := range todayMeals {
		mealTypes[meal.MealType] = true
	}

	if !mealTypes["breakfast"] {
		suggestions = append(suggestions, gin.H{
			"menu":   "Nasi uduk dengan ayam goreng dan sambal",
			"reason": "Sarapan bergizi untuk memulai hari dengan energi",
		})
	}
	if !mealTypes["lunch"] {
		suggestions = append(suggestions, gin.H{
			"menu":   "Nasi putih dengan rendang dan sayur lodeh",
			"reason": "Makan siang seimbang dengan protein dan sayuran",
		})
	}
	if !mealTypes["dinner"] {
		suggestions = append(suggestions, gin.H{
			"menu":   "Sup ikan dengan nasi putih dan tumis kangkung",
			"reason": "Makan malam ringan namun bergizi",
		})
	}

	// Add nutrition-specific suggestions
	if currentNutrition.Protein < 50 {
		suggestions = append(suggestions, gin.H{
			"menu":   "Soto ayam dengan nasi putih dan telur",
			"reason": fmt.Sprintf("Menambah protein (saat ini %.1fg dari target 50g)", currentNutrition.Protein),
		})
	}
	if currentNutrition.Fiber < 25 {
		suggestions = append(suggestions, gin.H{
			"menu":   "Gado-gado dengan lontong dan kerupuk",
			"reason": fmt.Sprintf("Menambah serat dari sayuran (saat ini %.1fg dari target 25g)", currentNutrition.Fiber),
		})
	}

	// Limit to 4 suggestions
	if len(suggestions) > 4 {
		suggestions = suggestions[:4]
	}

	if len(suggestions) == 0 {
		suggestions = append(suggestions, gin.H{
			"menu":   "Nasi campur dengan lauk seimbang",
			"reason": "Menu seimbang untuk melengkapi nutrisi harian",
		})
	}

	return suggestions
}

func buildMealSuggestionContext(currentNutrition schema.AINutrition, todayMeals []schema.FoodJournal, userID string) string {
	var context strings.Builder

	context.WriteString(fmt.Sprintf("Nutrisi hari ini:\n"))
	context.WriteString(fmt.Sprintf("- Kalori: %.0f kcal\n", currentNutrition.Calories))
	context.WriteString(fmt.Sprintf("- Protein: %.0f g\n", currentNutrition.Protein))
	context.WriteString(fmt.Sprintf("- Karbohidrat: %.0f g\n", currentNutrition.Carbs))
	context.WriteString(fmt.Sprintf("- Lemak: %.0f g\n", currentNutrition.Fat))
	context.WriteString(fmt.Sprintf("- Serat: %.0f g\n", currentNutrition.Fiber))
	context.WriteString(fmt.Sprintf("- Gula: %.0f g\n", currentNutrition.Sugar))

	mealTypes := map[string]bool{
		"breakfast": false,
		"lunch":     false,
		"dinner":    false,
		"snack":     false,
	}

	context.WriteString(fmt.Sprintf("\nMakanan yang sudah dimakan hari ini:\n"))
	for _, meal := range todayMeals {
		mealTypes[meal.MealType] = true
		context.WriteString(fmt.Sprintf("- %s (%s): %s\n",
			translateMealType(meal.MealType),
			meal.CreatedAt.Format("15:04"),
			meal.MealName))
	}

	context.WriteString(fmt.Sprintf("\nWaktu makan yang belum diisi:\n"))
	if !mealTypes["breakfast"] {
		context.WriteString("- Sarapan\n")
	}
	if !mealTypes["lunch"] {
		context.WriteString("- Makan Siang\n")
	}
	if !mealTypes["dinner"] {
		context.WriteString("- Makan Malam\n")
	}

	context.WriteString(fmt.Sprintf("\nKeterangan tambahan:\n"))
	context.WriteString("- Target harian: Kalori 2000 kcal, Protein 50g, Serat 25g\n")
	context.WriteString("- Preferensi: Makanan Indonesia yang sehat dan bergizi\n")

	return context.String()
}

func translateMealType(mealType string) string {
	switch mealType {
	case "breakfast":
		return "Sarapan"
	case "lunch":
		return "Makan Siang"
	case "dinner":
		return "Makan Malam"
	case "snack":
		return "Camilan"
	default:
		return mealType
	}
}

func parseEnhancedMealSuggestions(aiResponse string, currentNutrition schema.AINutrition, todayMeals []schema.FoodJournal) []gin.H {
	suggestions := []gin.H{}

	lines := strings.Split(aiResponse, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || len(line) < 10 {
			continue
		}

		lowerLine := strings.ToLower(line)
		if strings.Contains(lowerLine, "berdasarkan") ||
			strings.Contains(lowerLine, "format") ||
			strings.Contains(lowerLine, "saran") {
			continue
		}

		line = strings.TrimPrefix(line, "-")
		line = strings.TrimPrefix(line, "*")
		line = strings.TrimPrefix(line, "•")
		line = strings.TrimSpace(line)

		if strings.Contains(line, ".") && len(line) > 3 {
			parts := strings.SplitN(line, ".", 2)
			if len(parts) == 2 && len(strings.TrimSpace(parts[0])) <= 3 {
				line = strings.TrimSpace(parts[1])
			}
		}

		if isValidFoodSuggestion(line) {
			reason := generateMenuReason(line, currentNutrition, todayMeals)

			suggestions = append(suggestions, gin.H{
				"menu":   line,
				"reason": reason,
			})
		}
	}

	if len(suggestions) > 4 {
		suggestions = suggestions[:4]
	}

	// Fallback if no suggestions parsed
	if len(suggestions) == 0 {
		return generateBasicMealSuggestions(currentNutrition, todayMeals)
	}

	return suggestions
}

func isValidFoodSuggestion(text string) bool {
	if len(text) < 10 || len(text) > 200 {
		return false
	}

	lowerText := strings.ToLower(text)

	foodKeywords := []string{
		"nasi", "roti", "mie", "pasta", "quinoa", "oat", "sereal",
		"ayam", "ikan", "daging", "telur", "tahu", "tempe", "protein", "kacang",
		"sayur", "sayuran", "brokoli", "wortel", "bayam", "kangkung", "tomat",
		"goreng", "rebus", "bakar", "tumis", "kukus", "panggang",
		"sup", "sop", "salad", "jus", "smoothie", "bubur", "bakso", "rendang",
		"dengan", "dan", "plus", "campur",
	}

	hasKeyword := false
	for _, keyword := range foodKeywords {
		if strings.Contains(lowerText, keyword) {
			hasKeyword = true
			break
		}
	}

	if !hasKeyword {
		return false
	}

	excludeKeywords := []string{
		"berdasarkan", "format", "saran", "rekomendasi", "contoh", "tips",
		"catatan", "perhatian", "penting", "sebaiknya", "jangan", "hindari",
		"json", "array", "struktur", "response", "data", "api",
	}

	for _, exclude := range excludeKeywords {
		if strings.Contains(lowerText, exclude) {
			return false
		}
	}

	return true
}

func generateMenuReason(menu string, currentNutrition schema.AINutrition, todayMeals []schema.FoodJournal) string {
	menuLower := strings.ToLower(menu)

	mealTypes := map[string]bool{
		"breakfast": false,
		"lunch":     false,
		"dinner":    false,
	}

	for _, meal := range todayMeals {
		mealTypes[meal.MealType] = true
	}

	if !mealTypes["breakfast"] && isBreakfastFood(menuLower) {
		return "Sarapan bergizi untuk memulai hari dengan energi"
	}

	if !mealTypes["lunch"] && isLunchFood(menuLower) {
		return "Makan siang seimbang untuk energi siang hari"
	}

	if !mealTypes["dinner"] && isDinnerFood(menuLower) {
		return "Makan malam ringan namun bergizi"
	}

	if currentNutrition.Protein < 50 && isHighProteinFood(menuLower) {
		return fmt.Sprintf("Menambah protein (saat ini %.1fg dari target 50g)", currentNutrition.Protein)
	}

	if currentNutrition.Fiber < 25 && isHighFiberFood(menuLower) {
		return fmt.Sprintf("Menambah serat dari sayuran (saat ini %.1fg dari target 25g)", currentNutrition.Fiber)
	}

	if currentNutrition.Calories < 1500 && isHighCalorieFood(menuLower) {
		return fmt.Sprintf("Menambah kalori harian (saat ini %.0f dari target 2000)", currentNutrition.Calories)
	}

	if isHighFiberFood(menuLower) {
		return "Kaya serat dan vitamin untuk pencernaan sehat"
	}

	if isHighProteinFood(menuLower) {
		return "Sumber protein berkualitas tinggi untuk otot"
	}

	if isCarbohydrateFood(menuLower) {
		return "Karbohidrat untuk energi sehari-hari"
	}

	if isLowCalorieFood(menuLower) {
		return "Menu rendah kalori untuk menjaga berat badan"
	}

	return "Menu seimbang untuk melengkapi nutrisi harian"
}

func isBreakfastFood(menuLower string) bool {
	breakfastKeywords := []string{"bubur", "oat", "sereal", "roti", "pancake", "telur", "nasi uduk", "lontong"}
	return containsAny(menuLower, breakfastKeywords)
}

func isLunchFood(menuLower string) bool {
	lunchKeywords := []string{"nasi", "mie", "pasta", "quinoa", "salad utama"}
	return containsAny(menuLower, lunchKeywords)
}

func isDinnerFood(menuLower string) bool {
	dinnerKeywords := []string{"sup", "sop", "salad", "ringan", "kukus", "rebus"}
	return containsAny(menuLower, dinnerKeywords)
}

func isHighProteinFood(menuLower string) bool {
	proteinKeywords := []string{"ayam", "ikan", "daging", "telur", "tahu", "tempe", "protein", "kacang", "udang", "cumi", "salmon"}
	return containsAny(menuLower, proteinKeywords)
}

func isHighFiberFood(menuLower string) bool {
	fiberKeywords := []string{"sayur", "sayuran", "gado", "salad", "brokoli", "bayam", "kangkung", "wortel", "oat", "quinoa"}
	return containsAny(menuLower, fiberKeywords)
}

func isCarbohydrateFood(menuLower string) bool {
	carbKeywords := []string{"nasi", "roti", "mie", "pasta", "kentang", "ubi", "jagung", "oat"}
	return containsAny(menuLower, carbKeywords)
}

func isHighCalorieFood(menuLower string) bool {
	highCalKeywords := []string{"goreng", "santan", "krim", "keju", "alpukat", "kacang", "minyak"}
	return containsAny(menuLower, highCalKeywords)
}

func isLowCalorieFood(menuLower string) bool {
	lowCalKeywords := []string{"sup", "sop", "salad", "kukus", "rebus", "panggang tanpa minyak", "jus"}
	return containsAny(menuLower, lowCalKeywords)
}

func containsAny(text string, keywords []string) bool {
	for _, keyword := range keywords {
		if strings.Contains(text, keyword) {
			return true
		}
	}
	return false
}

func GetAllFoodJournalHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userData := user.(middleware.JWTUserData)

	data, err := repository.GetAllFoodJournalByUserID(userData.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response []gin.H
	for _, journal := range data {
		response = append(response, formatFoodJournalResponse(journal))
	}

	c.JSON(http.StatusOK, gin.H{
		"data": response,
	})
}

func GetTodayFoodJournalHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userData := user.(middleware.JWTUserData)

	data, err := repository.GetTodayFoodJournalByUserID(userData.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response []gin.H
	for _, journal := range data {
		response = append(response, formatFoodJournalResponse(journal))
	}

	c.JSON(http.StatusOK, gin.H{
		"data": response,
	})
}

// func GetFilteredFoodJournalHandler(c *gin.Context) {
// 	user, exists := c.Get("user")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
// 		return
// 	}

// 	userData := user.(middleware.JWTUserData)
// 	searchName := c.Query("meal_name")
// 	startDateStr := c.Query("start_date")
// 	endDateStr := c.Query("end_date")
// 	mealType := c.Query("meal_type")

// 	var startDate, endDate *time.Time

// 	if startDateStr != "" {
// 		if t, err := time.Parse("2006-01-02", startDateStr); err == nil {
// 			startDate = &t
// 		} else {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_date format"})
// 			return
// 		}
// 	}

// 	if endDateStr != "" {
// 		if t, err := time.Parse("2006-01-02", endDateStr); err == nil {
// 			endDate = &t
// 		} else {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_date format"})
// 			return
// 		}
// 	}

// 	data, err := repository.GetFilteredFoodJournal(userData.ID, searchName, startDate, endDate, mealType)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"data": data,
// 	})
// }

// func GetFoodJournalByMealTypeHandler(c *gin.Context) {
// 	user, exists := c.Get("user")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
// 		return
// 	}

// 	userData := user.(middleware.JWTUserData)
// 	mealType := c.Query("type")

// 	if mealType == "" {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Meal type is required"})
// 		return
// 	}

// 	data, err := repository.GetFoodJournalByMealType(userData.ID, mealType)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"data": data,
// 	})
// }

func CreateNewFoodJournalHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userData := user.(middleware.JWTUserData)
	userID, err := uuid.Parse(userData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req FoodJournalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	createdAt := req.CreatedAt
	if createdAt == "" {
		createdAt = ""
	}

	if req.InputType == "" {
		req.InputType = "text"
	}

	switch req.InputType {
	case "text":
		if req.Description == "" && req.ProcessedInput == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Description or processed input is required for text input"})
			return
		}
	case "image":
		if req.ImageURL == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Image URL is required for image input"})
			return
		}
	}

	err = service.CreateNewFoodJournal(service.FoodJournalInput{
		UserID:         userID,
		MealName:       req.MealName,
		MealType:       req.MealType,
		Description:    req.Description,
		FeelingBefore:  req.FeelingBefore,
		FeelingAfter:   req.FeelingAfter,
		ImageURL:       req.ImageURL,
		InputType:      req.InputType,
		RawInput:       req.RawInput,
		ProcessedInput: req.ProcessedInput,
		FoodAnalysis:   req.FoodAnalysis,
		CreatedAt:      createdAt,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Food journal created successfully"})
}

func UpdateFoodJournalHandler(c *gin.Context) {
	var req FoodJournalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := uuid.Parse(req.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid food journal ID"})
		return
	}

	var createdAt time.Time
	if req.CreatedAt != "" {
		createdAt, err = time.Parse("2006-01-02", req.CreatedAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid created at date format"})
			return
		}
	} else {
		createdAt = time.Now()
	}

	foodJournal := schema.FoodJournal{
		BaseModel:      schema.BaseModel{ID: id},
		MealName:       req.MealName,
		MealType:       req.MealType,
		Description:    req.Description,
		FeelingBefore:  req.FeelingBefore,
		FeelingAfter:   req.FeelingAfter,
		ImageURL:       req.ImageURL,
		InputType:      req.InputType,
		RawInput:       req.RawInput,
		ProcessedInput: req.ProcessedInput,
		CreatedAt:      createdAt,
		UpdatedAt:      time.Now(),
	}

	err = service.UpdateFoodJournal(foodJournal)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update food journal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Food journal updated successfully"})
}

func DeleteFoodJournalHandler(c *gin.Context) {
	journalID := c.Param("id")
	err := service.DeleteFoodJournal(journalID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete food journal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Food journal deleted successfully"})
}

func GetFoodJournalByIDHandler(c *gin.Context) {
	journalID := c.Param("id")
	if journalID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Journal ID is required"})
		return
	}

	journal, err := repository.GetFoodJournalByID(journalID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": formatFoodJournalResponse(*journal),
	})
}

func AnalyzeFoodFromTextHandler(c *gin.Context) {
	var req struct {
		Description string `json:"description" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	geminiService, err := service.NewGeminiService()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize AI service"})
		return
	}

	foodAnalysis, err := geminiService.AnalyzeFoodFromText(req.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to analyze food: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, foodAnalysis)
}

func AnalyzeFoodFromImageHandler(c *gin.Context) {
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image file is required"})
		return
	}
	defer file.Close()

	description := c.PostForm("description")

	geminiService, err := service.NewGeminiService()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize AI service"})
		return
	}

	foodAnalysis, err := geminiService.AnalyzeFoodFromImage(file, header)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to analyze food: " + err.Error()})
		return
	}

	if description != "" && strings.TrimSpace(description) != "" {
		foodAnalysis = enhanceFoodAnalysisWithText(geminiService, foodAnalysis, strings.TrimSpace(description))
	}

	c.JSON(http.StatusOK, foodAnalysis)
}

func enhanceFoodAnalysisWithText(geminiService *service.GeminiService, imageAnalysis *schema.FoodAnalysis, description string) *schema.FoodAnalysis {
	enhancedPrompt := fmt.Sprintf(
		"Based on the image analysis and additional description: '%s', please provide a more detailed and accurate analysis. %s",
		description, imageAnalysis.AnalysisText,
	)

	textAnalysis, err := geminiService.AnalyzeFoodFromText(enhancedPrompt)
	if err != nil || len(textAnalysis.DetectedFoods) == 0 {
		return imageAnalysis
	}

	mergedAnalysis := *imageAnalysis
	mergedAnalysis.DetectedFoods = mergeFoodDetections(imageAnalysis.DetectedFoods, textAnalysis.DetectedFoods)
	mergedAnalysis.TotalNutrition = calculateTotalNutrition(mergedAnalysis.DetectedFoods)
	mergedAnalysis.AnalysisText = fmt.Sprintf("Enhanced analysis combining image and description: %s. %s",
		description, imageAnalysis.AnalysisText)
	mergedAnalysis.Confidence = calculateAverageConfidence(imageAnalysis.Confidence, textAnalysis.Confidence)

	return &mergedAnalysis
}

func mergeFoodDetections(imageFoods, textFoods []schema.DetectedFood) []schema.DetectedFood {
	merged := make([]schema.DetectedFood, len(imageFoods))
	copy(merged, imageFoods)

	for i := range merged {
		if i < len(textFoods) {
			if textFoods[i].Description != "" {
				merged[i].Description = textFoods[i].Description
			}
			if textFoods[i].Portion != "" {
				merged[i].Portion = textFoods[i].Portion
			}
			merged[i].Nutrition = averageNutrition(merged[i].Nutrition, textFoods[i].Nutrition)
		}
	}

	return merged
}

func averageNutrition(n1, n2 schema.AINutrition) schema.AINutrition {
	return schema.AINutrition{
		Calories: (n1.Calories + n2.Calories) / 2,
		Protein:  (n1.Protein + n2.Protein) / 2,
		Carbs:    (n1.Carbs + n2.Carbs) / 2,
		Fat:      (n1.Fat + n2.Fat) / 2,
		Sugar:    (n1.Sugar + n2.Sugar) / 2,
		Fiber:    (n1.Fiber + n2.Fiber) / 2,
		Sodium:   (n1.Sodium + n2.Sodium) / 2,
	}
}

func calculateTotalNutrition(foods []schema.DetectedFood) schema.AINutrition {
	var total schema.AINutrition
	for _, food := range foods {
		total.Calories += food.Nutrition.Calories
		total.Protein += food.Nutrition.Protein
		total.Carbs += food.Nutrition.Carbs
		total.Fat += food.Nutrition.Fat
		total.Sugar += food.Nutrition.Sugar
		total.Fiber += food.Nutrition.Fiber
		total.Sodium += food.Nutrition.Sodium
	}
	return total
}

func calculateAverageConfidence(conf1, conf2 float64) float64 {
	average := (conf1 + conf2) / 2
	if average > 1.0 {
		return 1.0
	}
	return average
}
