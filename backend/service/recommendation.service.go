package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RecommendationService struct {
	repo              *repository.RecommendationRepository
	recipeDetailCache map[string]*schema.RecipeDetail
}

func NewRecommendationService(repo *repository.RecommendationRepository) *RecommendationService {
	return &RecommendationService{
		repo:              repo,
		recipeDetailCache: make(map[string]*schema.RecipeDetail),
	}
}

// Track user interaction with recipe
func (s *RecommendationService) TrackRecipeInteraction(userID uuid.UUID, recipeID, activityType string, viewDuration int, recipeData map[string]any) error {
	activity := &schema.UserActivity{
		BaseModel:    schema.BaseModel{ID: uuid.New()},
		UserID:       userID,
		RecipeID:     recipeID,
		ActivityType: activityType,
		ViewDuration: viewDuration,
		SessionID:    fmt.Sprintf("%s_%d", userID.String(), time.Now().Unix()),
	}

	// Extract recipe data
	if title, ok := recipeData["title"].(string); ok {
		activity.RecipeTitle = title
	}
	if slug, ok := recipeData["slug"].(string); ok {
		activity.RecipeSlug = slug
	}
	if cookingTime, ok := recipeData["cooking_time"].(float64); ok {
		activity.CookingTime = int(cookingTime)
	}
	if calories, ok := recipeData["calories"].(string); ok {
		activity.Calories = calories
	}
	if price, ok := recipeData["price"].(float64); ok {
		activity.Price = int(price)
	}

	// Extract tags
	if tags, ok := recipeData["tags"].([]any); ok {
		for _, tag := range tags {
			if tagMap, ok := tag.(map[string]any); ok {
				if name, ok := tagMap["name"].(string); ok {
					activity.RecipeTags = append(activity.RecipeTags, schema.UserActivityRecipeTag{
						Tag: name,
					})
				}
			}
		}
	}

	return s.repo.CreateActivity(activity)
}

// Gets recipe detail by slug from Yummy API
func (s *RecommendationService) getRecipeDetail(slug string) (*schema.RecipeDetail, error) {
	// Check cache
	if detail, exists := s.recipeDetailCache[slug]; exists {
		return detail, nil
	}

	url := fmt.Sprintf("https://www.yummy.co.id/api/recipe/detail/%s", slug)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var apiResp schema.RecipeDetailResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil, err
	}

	// Store in cache
	s.recipeDetailCache[slug] = &apiResp.Data

	return &apiResp.Data, nil
}

func (s *RecommendationService) matchIngredientWithUserItem(ingredientDesc string, userItems []schema.Item) (*schema.Item, float64) {
	ingredientDesc = strings.ToLower(strings.TrimSpace(ingredientDesc))

	var bestMatch *schema.Item
	var bestScore float64 = 0

	for i, item := range userItems {
		itemName := strings.ToLower(strings.TrimSpace(item.Name))

		// Exact match
		if itemName == ingredientDesc {
			return &userItems[i], 1.0
		}

		// Contains match
		if strings.Contains(ingredientDesc, itemName) || strings.Contains(itemName, ingredientDesc) {
			score := s.calculateStringSimilarity(ingredientDesc, itemName)
			if score > bestScore {
				bestScore = score
				bestMatch = &userItems[i]
			}
		}

		// Fuzzy match
		keywords := s.extractKeywords(ingredientDesc)
		for _, keyword := range keywords {
			if strings.Contains(itemName, keyword) || strings.Contains(keyword, itemName) {
				score := s.calculateStringSimilarity(keyword, itemName) * 0.8 // Slight penalty
				if score > bestScore {
					bestScore = score
					bestMatch = &userItems[i]
				}
			}
		}
	}

	if bestMatch != nil && bestScore > 0.3 { // Threshold minimum
		return bestMatch, bestScore
	}

	return nil, 0
}

func (s *RecommendationService) extractKeywords(description string) []string {
	// Remove common words
	commonWords := map[string]bool{
		"dan": true, "atau": true, "yang": true, "di": true, "ke": true,
		"dari": true, "untuk": true, "dengan": true, "secukupnya": true,
		"potong": true, "iris": true, "cincang": true, "halus": true,
		"sedang": true, "besar": true, "kecil": true, "gram": true, "ml": true,
		"sendok": true, "makan": true, "gelas": true, "buah": true,
	}

	words := strings.Fields(description)
	var keywords []string

	for _, word := range words {
		word = strings.ToLower(strings.TrimSpace(word))
		// Remove punctutation marks
		word = strings.Trim(word, ".,!?;:")

		if len(word) > 2 && !commonWords[word] {
			keywords = append(keywords, word)
		}
	}

	return keywords
}

// Calculates score based on the amount of an item.
func (s *RecommendationService) calculateAmountScore(userItem *schema.Item) float64 {
	switch strings.ToLower(userItem.AmountType) {
	case "gram", "kg", "g":
		if userItem.Amount >= 500 {
			return 1.0
		} else if userItem.Amount >= 250 {
			return 0.8
		} else if userItem.Amount >= 100 {
			return 0.6
		} else {
			return 0.3
		}
	case "ml", "liter":
		if userItem.Amount >= 500 {
			return 1.0
		} else if userItem.Amount >= 250 {
			return 0.8
		} else if userItem.Amount >= 100 {
			return 0.6
		} else {
			return 0.3
		}
	case "buah", "biji", "siung":
		if userItem.Amount >= 3 {
			return 1.0
		} else if userItem.Amount >= 2 {
			return 0.8
		} else if userItem.Amount >= 1 {
			return 0.6
		} else {
			return 0.2
		}
	default:
		// Default scoring
		if userItem.Amount >= 1 {
			return 0.8
		} else {
			return 0.3
		}
	}
}

func (s *RecommendationService) calculateExpiryUrgencyScore(userItem *schema.Item) float64 {
	now := time.Now()
	daysUntilExpiry := userItem.ExpDate.Sub(now).Hours() / 24

	if daysUntilExpiry <= 0 {
		return 0 // expired
	} else if daysUntilExpiry <= 1 {
		return 1.0 // Very urgent
	} else if daysUntilExpiry <= 3 {
		return 0.8 // Urgent
	} else if daysUntilExpiry <= 7 {
		return 0.6 // Moderate
	} else if daysUntilExpiry <= 14 {
		return 0.4 // Low priority
	} else {
		return 0.2 // Very low priority
	}
}

// Recommendations based on user preferences and available items
func (s *RecommendationService) GetRecommendations(userID uuid.UUID, limit int) ([]schema.Recipe, error) {
	// Get user items
	userItems, err := repository.GetAllFreshItem(userID.String())
	if err != nil {
		return nil, err
	}

	// Get user preferences
	userPref, err := s.repo.GetUserPreference(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			userPref = s.createDefaultPreference(userID)
		} else {
			return nil, err
		}
	}

	keywords := s.buildSearchKeywords(userItems)

	recipes, err := s.searchRecipes(keywords, limit*2) // more to filter
	if err != nil {
		return nil, err
	}

	// Score and rank recipes
	scoredRecipes := s.scoreRecipes(recipes, userItems, userPref)

	// Sort by score and return top results
	sort.Slice(scoredRecipes, func(i, j int) bool {
		return scoredRecipes[i].Score > scoredRecipes[j].Score
	})

	result := make([]schema.Recipe, 0, limit)
	for i, sr := range scoredRecipes {
		if i >= limit {
			break
		}
		result = append(result, sr.Recipe)
	}

	return result, nil
}

// Score recipes
type ScoredRecipe struct {
	Recipe schema.Recipe
	Score  float64
}

func (s *RecommendationService) scoreRecipes(recipes []schema.Recipe, userItems []schema.Item, userPref *schema.UserPreference) []ScoredRecipe {
	scored := make([]ScoredRecipe, len(recipes))

	for i, recipe := range recipes {
		score := 0.0

		// 1. Ingredient availability score (40% weight)
		ingredientScore := s.calculateIngredientScore(recipe, userItems)
		score += ingredientScore * 0.4

		// 2. User preference score (35% weight)
		prefScore := s.calculatePreferenceScore(recipe, userPref)
		score += prefScore * 0.35

		// 3. Expiry urgency score (25% weight)
		expiryScore := s.calculateExpiryScore(recipe, userItems)
		score += expiryScore * 0.25

		scored[i] = ScoredRecipe{Recipe: recipe, Score: score}
	}

	return scored
}

func (s *RecommendationService) calculateIngredientScore(recipe schema.Recipe, userItems []schema.Item) float64 {
	recipeDetail, err := s.getRecipeDetail(recipe.Slug)
	if err != nil {
		return s.calculateIngredientScoreFallback(recipe, userItems)
	}

	if len(recipeDetail.IngredientType) == 0 {
		return 0.3 // Neutral score if no ingredient
	}

	totalIngredients := 0
	totalScore := 0.0

	// Loop through all ingredient types
	for _, ingredientType := range recipeDetail.IngredientType {
		for _, ingredient := range ingredientType.Ingredients {
			totalIngredients++

			matchedItem, matchScore := s.matchIngredientWithUserItem(ingredient.Description, userItems)

			if matchedItem != nil {
				// Calculate score
				baseScore := matchScore
				amountScore := s.calculateAmountScore(matchedItem)
				expiryScore := s.calculateExpiryUrgencyScore(matchedItem)

				// Weighted combination:
				// - 50% match quality
				// - 30% amount availability
				// - 20% expiry urgency
				combinedScore := (baseScore * 0.5) + (amountScore * 0.3) + (expiryScore * 0.2)
				totalScore += combinedScore
			}
		}
	}

	if totalIngredients == 0 {
		return 0.3
	}

	finalScore := totalScore / float64(totalIngredients)

	// Bonus for high availability
	availabilityRatio := totalScore / float64(totalIngredients)
	if availabilityRatio > 0.7 {
		finalScore += 0.1
	}

	if finalScore > 1.0 {
		finalScore = 1.0
	}

	return finalScore
}

func (s *RecommendationService) calculateIngredientScoreFallback(recipe schema.Recipe, userItems []schema.Item) float64 {
	itemNames := make(map[string]bool)
	for _, item := range userItems {
		itemNames[strings.ToLower(item.Name)] = true
	}

	matches := 0
	total := len(recipe.Tags)
	if total == 0 {
		return 0.5 // neutral score
	}

	for _, tag := range recipe.Tags {
		tagName := strings.ToLower(tag.Name)
		if itemNames[tagName] {
			matches++
			continue
		}

		// Fuzzy matching
		for itemName := range itemNames {
			if s.calculateStringSimilarity(itemName, tagName) > 0.7 {
				matches++
				break
			}
		}
	}

	return float64(matches) / float64(total)
}

func (s *RecommendationService) calculatePreferenceScore(recipe schema.Recipe, userPref *schema.UserPreference) float64 {
	score := 0.0
	factors := 0

	// Cooking time preference
	if userPref.AvgCookingTime > 0 {
		timeDiff := math.Abs(float64(recipe.CookingTime - userPref.AvgCookingTime))
		timeScore := math.Max(0, 1.0-(timeDiff/60.0)) // Normalize by hour
		score += timeScore
		factors++
	}

	// Tag preferences
	if len(userPref.PreferredTags) > 0 {
		tagMatches := 0
		for _, recipeTag := range recipe.Tags {
			for _, prefTag := range userPref.PreferredTags {
				if strings.EqualFold(recipeTag.Name, prefTag.Tag) {
					tagMatches++
					break
				}
			}
		}
		tagScore := float64(tagMatches) / float64(len(userPref.PreferredTags))
		score += tagScore
		factors++
	}

	// Rating boost
	if recipe.Rating > 0 {
		score += recipe.Rating / 5.0
		factors++
	}

	if factors == 0 {
		return 0.5
	}

	return score / float64(factors)
}

func (s *RecommendationService) calculateExpiryScore(recipe schema.Recipe, userItems []schema.Item) float64 {
	urgentItems := 0
	totalItems := len(userItems)

	if totalItems == 0 {
		return 0
	}

	now := time.Now()
	for _, item := range userItems {
		daysUntilExpiry := item.ExpDate.Sub(now).Hours() / 24
		if daysUntilExpiry <= 3 && daysUntilExpiry > 0 {
			// Check if this urgent item could be used in recipe
			for _, tag := range recipe.Tags {
				if strings.Contains(strings.ToLower(tag.Name), strings.ToLower(item.Name)) {
					urgentItems++
					break
				}
			}
		}
	}

	return float64(urgentItems) / float64(totalItems)
}

// Search recipes using external API
func (s *RecommendationService) searchRecipes(keywords string, limit int) ([]schema.Recipe, error) {
	if keywords == "" {
		keywords = "resep-harian" // fallback
	}

	url := fmt.Sprintf("https://www.yummy.co.id/api/search/open-search/recipe?type=home&keyword=%s&page=1&limit=%d", keywords, limit)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var apiResp schema.RecipeListResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil, err
	}

	return apiResp.Data.Result, nil
}

// Utility functions
func (s *RecommendationService) createDefaultPreference(userID uuid.UUID) *schema.UserPreference {
	return &schema.UserPreference{
		BaseModel:            schema.BaseModel{ID: uuid.New()},
		UserID:               userID,
		AvgCookingTime:       30,
		AvgCalories:          400,
		PriceRange:           "10k-30k",
		ServingPreference:    1,
		LastUpdated:          time.Now(),
		PreferredTags:        []schema.UserPreferenceTag{},
		PreferredCategories:  []schema.UserPreferenceCategory{},
		PreferredIngredients: []schema.UserPreferenceIngredient{},
		DislikedIngredients:  []schema.UserDislikedIngredient{},
	}
}

// Batch learning process (run periodically)
func (s *RecommendationService) UpdateUserPreferences() error {
	// Get all recent activities
	activities, err := s.repo.GetAllUserActivitiesForLearning()
	if err != nil {
		return err
	}

	// Group by user
	userActivities := make(map[uuid.UUID][]schema.UserActivity)
	for _, activity := range activities {
		userActivities[activity.UserID] = append(userActivities[activity.UserID], activity)
	}

	// Update preferences for each user
	for userID, userActs := range userActivities {
		if err := s.updateSingleUserPreference(userID, userActs); err != nil {
			continue
		}
	}

	return nil
}

func (s *RecommendationService) updateSingleUserPreference(userID uuid.UUID, activities []schema.UserActivity) error {
	pref, err := s.repo.GetUserPreference(userID)
	if err != nil {
		pref = s.createDefaultPreference(userID)
	}

	// Analyze activities and update preferences
	tagFreq := make(map[string]int)
	totalCookingTime := 0
	cookingTimeCount := 0

	for _, activity := range activities {
		// Weight recent activities higher
		weight := s.calculateActivityWeight(activity.CreatedAt)

		switch activity.ActivityType {
		case "cooked":
			weight *= 2.0 // 2x boost
		case "detail_view":
			// Scale view duration impact (0-100% boost)
			viewImpact := math.Min(1.0, float64(activity.ViewDuration)/300.0)
			weight *= (1.0 + viewImpact) // Up to 2x boost
		}

		// Collect tags
		for _, tag := range activity.RecipeTags {
			tagFreq[tag.Tag] += int(weight * 10)
		}

		// Collect cooking times
		if activity.CookingTime > 0 {
			totalCookingTime += int(float64(activity.CookingTime) * weight)
			cookingTimeCount++
		}
	}

	// Update preferred tags (top 10)
	type TagScore struct {
		Tag   string
		Score int
	}

	tagScores := make([]TagScore, 0, len(tagFreq))
	for tag, score := range tagFreq {
		tagScores = append(tagScores, TagScore{Tag: tag, Score: score})
	}

	sort.Slice(tagScores, func(i, j int) bool {
		return tagScores[i].Score > tagScores[j].Score
	})

	pref.PreferredTags = make([]schema.UserPreferenceTag, 0, 10)
	for i, ts := range tagScores {
		if i >= 10 {
			break
		}
		pref.PreferredTags = append(pref.PreferredTags, schema.UserPreferenceTag{
			Tag: ts.Tag,
		})
	}

	// Update average cooking time
	if cookingTimeCount > 0 {
		pref.AvgCookingTime = totalCookingTime / cookingTimeCount
	}

	pref.LastUpdated = time.Now()
	return s.repo.UpsertUserPreference(pref)
}

func (s *RecommendationService) calculateActivityWeight(activityTime time.Time) float64 {
	daysSince := time.Since(activityTime).Hours() / 24
	if daysSince <= 7 {
		return 1.0 // last week
	} else if daysSince <= 30 {
		return 0.8 // last month
	} else if daysSince <= 90 {
		return 0.5 // last 3 months
	}
	return 0.1 // Minimal weight for older data
}
