package service

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"

	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
)

type FoodJournalService struct {
	repo          *repository.FoodJournalRepository
	geminiService *GeminiService
}

func NewFoodJournalService(repo *repository.FoodJournalRepository, geminiService *GeminiService) *FoodJournalService {
	return &FoodJournalService{
		repo:          repo,
		geminiService: geminiService,
	}
}

func (s *FoodJournalService) CreateFoodJournal(userID uuid.UUID, req *schema.FoodJournalCreate) (*schema.FoodJournal, error) {
	// Create food journal entry
	foodJournal := &schema.FoodJournal{
		BaseModel:      schema.BaseModel{ID: uuid.New()},
		UserID:         userID,
		MealName:       req.MealName,
		MealType:       req.MealType,
		Description:    req.Description,
		FeelingBefore:  req.FeelingBefore,
		FeelingAfter:   req.FeelingAfter,
		ImageURL:       req.ImageURL,
		VoiceURL:       req.VoiceURL,
		TranscriptText: req.TranscriptText,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// Process with AI for nutrition analysis and recommendations
	if err := s.processWithAI(foodJournal); err != nil {
		log.Printf("Error processing with AI: %v", err)
		// Continue without AI processing - don't fail the entire request
	}

	// Save to database
	if err := s.repo.Create(foodJournal); err != nil {
		return nil, fmt.Errorf("failed to create food journal: %w", err)
	}

	return foodJournal, nil
}

func (s *FoodJournalService) processWithAI(foodJournal *schema.FoodJournal) error {
	// Prepare prompt for AI analysis
	prompt := s.buildNutritionAnalysisPrompt(foodJournal)

	// Get AI response
	response, err := s.geminiService.AnalyzeText(prompt)
	if err != nil {
		return fmt.Errorf("failed to get AI analysis: %w", err)
	}

	// Parse AI response
	aiResult, err := s.parseAIResponse(response)
	if err != nil {
		return fmt.Errorf("failed to parse AI response: %w", err)
	}

	// Set AI results
	foodJournal.AINutrition = aiResult.Nutrition
	foodJournal.AIFeedback = aiResult.Feedback
	foodJournal.AIRecommendations = aiResult.Recommendations

	return nil
}

func (s *FoodJournalService) buildNutritionAnalysisPrompt(foodJournal *schema.FoodJournal) string {
	prompt := fmt.Sprintf(`
Analyze the following food journal entry and provide nutrition estimation and recommendations in JSON format:

Meal Name: %s
Meal Type: %s
Description: %s
Feeling Before: %s
Feeling After: %s
Transcript: %s

Please provide a JSON response with the following structure:
{
  "nutrition": {
    "calories": 0.0,
    "protein": 0.0,
    "carbs": 0.0,
    "fat": 0.0,
    "sugar": 0.0,
    "fiber": 0.0,
    "sodium": 0.0,
    "confidence": 0.0
  },
  "feedback": "Provide encouraging feedback about their food choice and eating patterns",
  "recommendations": {
    "next_meal_suggestion": "Suggest what they should eat next based on this meal",
    "nutrition_tips": "Provide helpful nutrition tips",
    "motivational_message": "Give a motivational message based on their feelings and food choices"
  }
}

Consider:
- Estimate nutritional values based on typical portions and ingredients
- Provide personalized feedback based on their feelings before/after eating
- Give constructive recommendations for balanced nutrition
- Keep the tone positive and encouraging
- If feeling after eating is "still_hungry", suggest adding more protein or fiber
- If feeling "too_full", suggest smaller portions or eating slower next time
`,
		foodJournal.MealName,
		foodJournal.MealType,
		foodJournal.Description,
		foodJournal.FeelingBefore,
		foodJournal.FeelingAfter,
		foodJournal.TranscriptText,
	)

	return prompt
}

type AIAnalysisResult struct {
	Nutrition       schema.AINutrition       `json:"nutrition"`
	Feedback        string                   `json:"feedback"`
	Recommendations schema.AIRecommendations `json:"recommendations"`
}

func (s *FoodJournalService) parseAIResponse(response string) (*AIAnalysisResult, error) {
	var result AIAnalysisResult

	// Try to extract JSON from the response
	start := -1
	end := -1
	braceCount := 0

	for i, char := range response {
		if char == '{' {
			if start == -1 {
				start = i
			}
			braceCount++
		} else if char == '}' {
			braceCount--
			if braceCount == 0 && start != -1 {
				end = i + 1
				break
			}
		}
	}

	if start == -1 || end == -1 {
		return nil, fmt.Errorf("no valid JSON found in AI response")
	}

	jsonStr := response[start:end]
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal AI response: %w", err)
	}

	// Set default confidence if not provided
	if result.Nutrition.Confidence == 0 {
		result.Nutrition.Confidence = 0.7 // Default confidence
	}

	return &result, nil
}

func (s *FoodJournalService) GetFoodJournalByID(id uuid.UUID) (*schema.FoodJournal, error) {
	return s.repo.GetByID(id)
}

func (s *FoodJournalService) GetUserFoodJournals(userID uuid.UUID, limit, offset int) ([]schema.FoodJournal, error) {
	return s.repo.GetByUserID(userID, limit, offset)
}

func (s *FoodJournalService) GetTodayFoodJournals(userID uuid.UUID) ([]schema.FoodJournal, error) {
	return s.repo.GetTodayByUserID(userID)
}

func (s *FoodJournalService) GetNutritionSummary(userID uuid.UUID, startDate, endDate time.Time) (*schema.AINutrition, error) {
	return s.repo.GetNutritionSummaryByUserID(userID, startDate, endDate)
}

func (s *FoodJournalService) GetDashboardData(userID uuid.UUID) (map[string]interface{}, error) {
	// Get today's nutrition
	todayStart := time.Now().Truncate(24 * time.Hour)
	todayEnd := todayStart.Add(24 * time.Hour)

	todayNutrition, err := s.repo.GetNutritionSummaryByUserID(userID, todayStart, todayEnd)
	if err != nil {
		return nil, fmt.Errorf("failed to get today's nutrition: %w", err)
	}

	// Get recent meals (last 7 days)
	weekAgo := time.Now().AddDate(0, 0, -7)
	recentMeals, err := s.repo.GetByUserIDAndDateRange(userID, weekAgo, time.Now())
	if err != nil {
		return nil, fmt.Errorf("failed to get recent meals: %w", err)
	}

	// Get AI recommendations for next meal based on today's intake
	todayMeals, err := s.repo.GetTodayByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get today's meals: %w", err)
	}

	nextMealSuggestions := s.generateNextMealSuggestions(todayNutrition, todayMeals)

	return map[string]interface{}{
		"today_nutrition":       todayNutrition,
		"recent_meals":          recentMeals,
		"next_meal_suggestions": nextMealSuggestions,
	}, nil
}

func (s *FoodJournalService) generateNextMealSuggestions(nutrition *schema.AINutrition, todayMeals []schema.FoodJournal) []string {
	suggestions := []string{}

	// Basic nutrition-based suggestions
	if nutrition.Protein < 50 {
		suggestions = append(suggestions, "Add more protein-rich foods like chicken, fish, or legumes")
	}
	if nutrition.Fiber < 25 {
		suggestions = append(suggestions, "Include more fiber-rich vegetables and whole grains")
	}
	if nutrition.Calories < 1200 {
		suggestions = append(suggestions, "Consider a nutrient-dense snack with healthy fats")
	}

	// Default suggestions if none specific
	if len(suggestions) == 0 {
		suggestions = []string{
			"A balanced meal with lean protein and vegetables",
			"Greek yogurt with berries and nuts",
			"Quinoa bowl with mixed vegetables",
		}
	}

	return suggestions
}

func (s *FoodJournalService) UpdateFoodJournal(id uuid.UUID, req *schema.FoodJournalUpdate) error {
	updates := make(map[string]interface{})

	if req.MealName != nil {
		updates["meal_name"] = *req.MealName
	}
	if req.MealType != nil {
		updates["meal_type"] = *req.MealType
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.FeelingBefore != nil {
		updates["feeling_before"] = *req.FeelingBefore
	}
	if req.FeelingAfter != nil {
		updates["feeling_after"] = *req.FeelingAfter
	}
	if req.ImageURL != nil {
		updates["image_url"] = *req.ImageURL
	}
	if req.VoiceURL != nil {
		updates["voice_url"] = *req.VoiceURL
	}
	if req.TranscriptText != nil {
		updates["transcript_text"] = *req.TranscriptText
	}

	updates["updated_at"] = time.Now()

	return s.repo.Update(id, updates)
}

func (s *FoodJournalService) DeleteFoodJournal(id uuid.UUID) error {
	return s.repo.Delete(id)
}
