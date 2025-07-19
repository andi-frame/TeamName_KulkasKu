package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/andi-frame/TeamName_KulkasKu/backend/utils"
)

// Enhanced Recipe struct with additional fields from API response
type Recipe struct {
	ID           string  `json:"id"`
	Title        string  `json:"title"`
	Slug         string  `json:"slug"`
	Rating       float32 `json:"rating"`
	VisitedCount int     `json:"visited_count"`
	CookingTime  int     `json:"cooking_time"`
	StepCount    int     `json:"step_count"`
	CoverURL     string  `json:"cover_url"`
	Calories     string  `json:"calories"`
	Subcategory  string  `json:"subcategory"`
	Author       struct {
		Name       string `json:"name"`
		Username   string `json:"username"`
		IsOfficial bool   `json:"is_official"`
	} `json:"author"`
	Tags []struct {
		Name string `json:"name"`
		Slug string `json:"slug"`
	} `json:"tags"`
}

type RecipeDetail struct {
	Ingredients []Ingredient `json:"ingredients"`
}

type Ingredient struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type YummyResponse struct {
	Status int `json:"status"`
	Data   struct {
		ResultCount int      `json:"result_count"`
		Result      []Recipe `json:"result"`
	} `json:"data"`
}

type YummyDetailResponse struct {
	Status int          `json:"status"`
	Data   RecipeDetail `json:"data"`
}

type ItemCombination struct {
	Keywords           []string
	KeywordString      string
	Score              float64
	BestRecipe         Recipe
	MissingIngredients int
	TotalIngredients   int
	ExpDateScore       float64
	RecipeQualityScore float64
	AvailabilityScore  float64
}

type CombinationResult struct {
	Combination ItemCombination
	Error       error
}

const (
	MaxConcurrentWorkers = 10
	APITimeout           = 10 * time.Second
	MaxRecipesPerCombo   = 10 // Maximum recipes to consider per combination
	GlobalRecipeLimit    = 10 // Fixed number of best recipes to return globally

)

func GetAllOptimalItems(page int, limit int, userID string) ([]ItemCombination, error) {
	items, err := repository.GetAllFreshItem(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get fresh items: %v", err)
	}

	uniqueItems := getUniqueItems(items)

	// Generate combinations
	var combinations [][]schema.Item
	combinations = append(combinations, []schema.Item{}) // Empty combination

	if len(uniqueItems) > 0 {
		itemCombinations := generateCombinations(uniqueItems, 1, len(uniqueItems))
		combinations = append(combinations, itemCombinations...)
	}

	// Process combinations concurrently
	scoredCombinations := processCombinationsConcurrently(combinations)

	// Flatten all recipes from all combinations
	var allRecipes []ItemCombination
	for _, combo := range scoredCombinations {
		if combo.BestRecipe.ID != "" { // Valid recipe found
			allRecipes = append(allRecipes, combo)
		}
	}

	// Sort ALL recipes by global score (DESC)
	sort.Slice(allRecipes, func(i, j int) bool {
		return allRecipes[i].Score > allRecipes[j].Score
	})

	// Return top N globally
	if len(allRecipes) > GlobalRecipeLimit {
		return allRecipes[:GlobalRecipeLimit], nil
	}
	return allRecipes, nil
}

func processCombinationsConcurrently(combinations [][]schema.Item) []ItemCombination {
	jobs := make(chan []schema.Item, len(combinations))
	results := make(chan CombinationResult, len(combinations)*MaxRecipesPerCombo) // Larger buffer

	var wg sync.WaitGroup
	numWorkers := min(len(combinations), MaxConcurrentWorkers)

	for range numWorkers {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for combo := range jobs {
				// Get multiple recipes per combination
				recipes, err := scoreCombinationMulti(combo)
				if err != nil {
					results <- CombinationResult{Error: err}
					continue
				}

				for _, recipe := range recipes {
					results <- CombinationResult{Combination: recipe}
				}
			}
		}()
	}

	go func() {
		for _, combo := range combinations {
			jobs <- combo
		}
		close(jobs)
	}()

	go func() {
		wg.Wait()
		close(results)
	}()

	var scoredCombinations []ItemCombination
	for result := range results {
		if result.Error != nil {
			fmt.Printf("Error processing combination: %v\n", result.Error)
			continue
		}
		scoredCombinations = append(scoredCombinations, result.Combination)
	}

	return scoredCombinations
}

// NEW: Get multiple top recipes per combination
func scoreCombinationMulti(items []schema.Item) ([]ItemCombination, error) {
	// Create keyword string for API call
	var keywords []string
	for _, item := range items {
		keywords = append(keywords, strings.ToLower(strings.TrimSpace(item.Name)))
	}

	keywordString := strings.Join(keywords, "-")
	if len(keywords) == 0 {
		keywordString = "resep" // Default search
	}

	// API Call with context for timeout
	ctx, cancel := context.WithTimeout(context.Background(), APITimeout)
	defer cancel()

	recipes, err := searchRecipesWithContext(ctx, keywordString)
	if err != nil {
		return nil, fmt.Errorf("failed to search recipes: %v", err)
	}

	if len(recipes) == 0 {
		return nil, fmt.Errorf("no recipes found for keywords: %s", keywordString)
	}

	// Sort recipes by quality score (DESC)
	sort.Slice(recipes, func(i, j int) bool {
		return calculateRecipeQualityScore(recipes[i]) > calculateRecipeQualityScore(recipes[j])
	})

	// Take top recipes per combination
	maxPerCombo := MaxRecipesPerCombo
	if len(recipes) < maxPerCombo {
		maxPerCombo = len(recipes)
	}
	topRecipes := recipes[:maxPerCombo]

	// Score each recipe individually
	var comboRecipes []ItemCombination
	for _, recipe := range topRecipes {
		// Calculate missing ingredients
		missingIngredients, totalIngredients := calculateMissingIngredientsConcurrent(ctx, recipe.Slug, keywords)

		// Calculate component scores
		expDateScore := calculateExpDateScore(items)
		recipeQualityScore := calculateRecipeQualityScore(recipe)
		availabilityScore := calculateAvailabilityScore(missingIngredients, totalIngredients)

		// Calculate overall score
		overallScore := calculateEnhancedScore(recipe, missingIngredients, totalIngredients,
			expDateScore, recipeQualityScore, availabilityScore)

		comboRecipes = append(comboRecipes, ItemCombination{
			Keywords:           keywords,
			KeywordString:      keywordString,
			Score:              overallScore,
			BestRecipe:         recipe,
			MissingIngredients: missingIngredients,
			TotalIngredients:   totalIngredients,
			ExpDateScore:       expDateScore,
			RecipeQualityScore: recipeQualityScore,
			AvailabilityScore:  availabilityScore,
		})
	}

	return comboRecipes, nil
}

func getUniqueItems(items []schema.Item) []schema.Item {
	itemMap := make(map[string]schema.Item)

	for _, item := range items {
		itemName := strings.ToLower(strings.TrimSpace(item.Name))

		// Keep the item with earliest expiration date
		if existing, exists := itemMap[itemName]; !exists || item.ExpDate.Before(existing.ExpDate) {
			itemMap[itemName] = item
		}
	}

	var uniqueItems []schema.Item
	for _, item := range itemMap {
		uniqueItems = append(uniqueItems, item)
	}

	// Sort by expiration date
	sort.Slice(uniqueItems, func(i, j int) bool {
		return uniqueItems[i].ExpDate.Before(uniqueItems[j].ExpDate)
	})

	return uniqueItems
}

func generateCombinations(items []schema.Item, minSize, maxSize int) [][]schema.Item {
	var combinations [][]schema.Item

	for size := minSize; size <= maxSize && size <= len(items); size++ {
		combos := getCombinations(items, size)
		combinations = append(combinations, combos...)
	}

	return combinations
}

func getCombinations(items []schema.Item, size int) [][]schema.Item {
	var result [][]schema.Item

	var backtrack func(start int, current []schema.Item)
	backtrack = func(start int, current []schema.Item) {
		if len(current) == size {
			combo := make([]schema.Item, len(current))
			copy(combo, current)
			result = append(result, combo)
			return
		}

		for i := start; i < len(items); i++ {
			current = append(current, items[i])
			backtrack(i+1, current)
			current = current[:len(current)-1]
		}
	}

	backtrack(0, []schema.Item{})
	return result
}

func scoreCombination(items []schema.Item) (ItemCombination, error) {
	// Create keyword string for API call
	var keywords []string
	for _, item := range items {
		keywords = append(keywords, strings.ToLower(strings.TrimSpace(item.Name)))
	}

	keywordString := strings.Join(keywords, "-")
	if len(keywords) == 0 {
		keywordString = "resep" // Default search
	}

	// API Call with context for timeout
	ctx, cancel := context.WithTimeout(context.Background(), APITimeout)
	defer cancel()

	recipes, err := searchRecipesWithContext(ctx, keywordString)
	if err != nil {
		return ItemCombination{}, fmt.Errorf("failed to search recipes: %v", err)
	}

	if len(recipes) == 0 {
		return ItemCombination{}, fmt.Errorf("no recipes found for keywords: %s", keywordString)
	}

	// Find the best recipe using enhanced scoring
	bestRecipe := findBestRecipeEnhanced(recipes)

	// Calculate missing ingredients concurrently
	missingIngredients, totalIngredients := calculateMissingIngredientsConcurrent(ctx, bestRecipe.Slug, keywords)

	// Calculate component scores
	expDateScore := calculateExpDateScore(items)
	recipeQualityScore := calculateRecipeQualityScore(bestRecipe)
	availabilityScore := calculateAvailabilityScore(missingIngredients, totalIngredients)

	// Calculate overall score using enhanced algorithm
	overallScore := calculateEnhancedScore(bestRecipe, missingIngredients, totalIngredients, expDateScore, recipeQualityScore, availabilityScore)

	return ItemCombination{
		Keywords:           keywords,
		KeywordString:      keywordString,
		Score:              overallScore,
		BestRecipe:         bestRecipe,
		MissingIngredients: missingIngredients,
		TotalIngredients:   totalIngredients,
		ExpDateScore:       expDateScore,
		RecipeQualityScore: recipeQualityScore,
		AvailabilityScore:  availabilityScore,
	}, nil
}

func searchRecipesWithContext(ctx context.Context, keywords string) ([]Recipe, error) {
	url := fmt.Sprintf("https://www.yummy.co.id/api/search/open-search/recipe?type=home&keyword=%s&page=1&limit=10", keywords)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	client := &http.Client{Timeout: APITimeout}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var yummyResp YummyResponse
	if err := json.NewDecoder(resp.Body).Decode(&yummyResp); err != nil {
		return nil, err
	}

	if yummyResp.Status != 200 {
		return nil, fmt.Errorf("API returned status %d", yummyResp.Status)
	}

	return yummyResp.Data.Result, nil
}

func findBestRecipeEnhanced(recipes []Recipe) Recipe {
	if len(recipes) == 0 {
		return Recipe{}
	}

	bestRecipe := recipes[0]
	bestScore := calculateRecipeQualityScore(bestRecipe)

	for _, recipe := range recipes[1:] {
		score := calculateRecipeQualityScore(recipe)
		if score > bestScore {
			bestScore = score
			bestRecipe = recipe
		}
	}

	return bestRecipe
}

func calculateRecipeQualityScore(recipe Recipe) float64 {
	// Enhanced scoring based on multiple factors
	ratingScore := float64(recipe.Rating) * 20.0 // Rating out of 5, scale to 100

	// Visited count score with logarithmic scaling to prevent domination
	visitedScore := 0.0
	if recipe.VisitedCount > 0 {
		visitedScore = utils.MinFloat(float64(recipe.VisitedCount)*0.01, 30.0) // Cap at 30
	}

	// Cooking time score (shorter is better for convenience)
	cookingTimeScore := 0.0
	if recipe.CookingTime > 0 {
		if recipe.CookingTime <= 30 {
			cookingTimeScore = 20.0 // Bonus for quick recipes
		} else if recipe.CookingTime <= 60 {
			cookingTimeScore = 15.0
		} else {
			cookingTimeScore = 10.0
		}
	}

	// Step count score (fewer steps is better)
	stepScore := 0.0
	if recipe.StepCount > 0 {
		if recipe.StepCount <= 5 {
			stepScore = 15.0
		} else if recipe.StepCount <= 10 {
			stepScore = 10.0
		} else {
			stepScore = 5.0
		}
	}

	// Official author bonus
	authorScore := 0.0
	if recipe.Author.IsOfficial {
		authorScore = 10.0
	}

	// Tag relevance score
	tagScore := calculateTagRelevanceScore(recipe.Tags)

	// Weighted combination
	totalScore := (ratingScore * 0.4) + (visitedScore * 0.2) + (cookingTimeScore * 0.15) +
		(stepScore * 0.1) + (authorScore * 0.1) + (tagScore * 0.05)

	return totalScore
}

func calculateTagRelevanceScore(tags []struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}) float64 {
	preferredTags := map[string]float64{
		"makanan-utama":   5.0,
		"makanan-rumahan": 4.0,
		"makanan-sehat":   3.0,
		"praktis":         3.0,
		"mudah":           2.0,
	}

	score := 0.0
	for _, tag := range tags {
		if weight, exists := preferredTags[tag.Slug]; exists {
			score += weight
		}
	}

	return utils.MinFloat(score, 10.0) // Cap at 10
}

func calculateMissingIngredientsConcurrent(ctx context.Context, slug string, availableIngredients []string) (int, int) {
	// Use goroutine with context for timeout
	type result struct {
		missing int
		total   int
		err     error
	}

	resultChan := make(chan result, 1)

	go func() {
		missing, total, err := calculateMissingIngredients(ctx, slug, availableIngredients)
		resultChan <- result{missing, total, err}
	}()

	select {
	case res := <-resultChan:
		if res.err != nil {
			// Fallback to estimation
			estimated := estimateMissingIngredients(len(availableIngredients))
			return estimated, len(availableIngredients) + estimated
		}
		return res.missing, res.total
	case <-ctx.Done():
		// Timeout fallback
		estimated := estimateMissingIngredients(len(availableIngredients))
		return estimated, len(availableIngredients) + estimated
	}
}

func calculateMissingIngredients(ctx context.Context, slug string, availableIngredients []string) (int, int, error) {
	if slug == "" {
		return 0, 0, fmt.Errorf("empty slug")
	}

	url := fmt.Sprintf("https://www.yummy.co.id/api/recipe/detail/%s", slug)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return 0, 0, err
	}

	client := &http.Client{Timeout: APITimeout}
	resp, err := client.Do(req)
	if err != nil {
		return 0, 0, err
	}
	defer resp.Body.Close()

	var detailResp YummyDetailResponse
	if err := json.NewDecoder(resp.Body).Decode(&detailResp); err != nil {
		return 0, 0, err
	}

	if detailResp.Status != 200 {
		return 0, 0, fmt.Errorf("detail API returned status %d", detailResp.Status)
	}

	totalIngredients := len(detailResp.Data.Ingredients)
	missingCount := 0

	// Create map for faster lookup
	availableMap := make(map[string]bool)
	for _, ingredient := range availableIngredients {
		availableMap[strings.ToLower(strings.TrimSpace(ingredient))] = true
	}

	// Count missing ingredients with fuzzy matching
	for _, ingredient := range detailResp.Data.Ingredients {
		ingredientName := strings.ToLower(strings.TrimSpace(ingredient.Name))
		if !isIngredientAvailable(ingredientName, availableMap) {
			missingCount++
		}
	}

	return missingCount, totalIngredients, nil
}

func isIngredientAvailable(ingredientName string, availableMap map[string]bool) bool {
	// Direct match
	if availableMap[ingredientName] {
		return true
	}

	// Fuzzy matching - check if ingredient name contains any available ingredient
	for available := range availableMap {
		if strings.Contains(ingredientName, available) || strings.Contains(available, ingredientName) {
			return true
		}
	}

	return false
}

func estimateMissingIngredients(availableCount int) int {
	// More sophisticated estimation based on recipe complexity
	estimatedTotal := 6 // Average recipe has 6 ingredients
	if availableCount > 3 {
		estimatedTotal = 8 // More complex recipes for more ingredients
	}

	missing := utils.MaxInt(estimatedTotal-availableCount, 0)
	return missing
}

func calculateExpDateScore(items []schema.Item) float64 {
	if len(items) == 0 {
		return 0
	}

	now := time.Now()
	totalUrgency := 0.0

	for _, item := range items {
		daysUntilExp := item.ExpDate.Sub(now).Hours() / 24

		// More nuanced urgency scoring
		if daysUntilExp <= 0 {
			totalUrgency += 120 // Expired items get highest priority
		} else if daysUntilExp <= 1 {
			totalUrgency += 100
		} else if daysUntilExp <= 2 {
			totalUrgency += 80
		} else if daysUntilExp <= 3 {
			totalUrgency += 60
		} else if daysUntilExp <= 7 {
			totalUrgency += 40
		} else if daysUntilExp <= 14 {
			totalUrgency += 20
		} else {
			totalUrgency += 10
		}
	}

	return totalUrgency / float64(len(items))
}

func calculateAvailabilityScore(missingIngredients, totalIngredients int) float64 {
	if totalIngredients == 0 {
		return 0
	}
	return float64(totalIngredients-missingIngredients) / float64(totalIngredients) * 100
}

func calculateEnhancedScore(recipe Recipe, missingIngredients, totalIngredients int, expDateScore, recipeQualityScore, availabilityScore float64) float64 {
	// Normalize scores to 0-100 range
	normalizedExpScore := utils.MinFloat(expDateScore, 100.0)
	normalizedQualityScore := utils.MinFloat(recipeQualityScore, 100.0)
	normalizedAvailabilityScore := utils.MinFloat(availabilityScore, 100.0)

	// Dynamic weighting based on context
	// If items are expiring soon, increase urgency weight
	urgencyWeight := 0.2
	if expDateScore > 80 {
		urgencyWeight = 0.4 // Increase urgency weight for soon-to-expire items
	}

	// If very few ingredients are available, increase availability weight
	availabilityWeight := 0.4
	if availabilityScore < 30 {
		availabilityWeight = 0.5 // Increase availability weight when ingredients are scarce
	}

	// Adjust quality weight accordingly
	qualityWeight := 1.0 - urgencyWeight - availabilityWeight

	// Calculate final score
	finalScore := (normalizedAvailabilityScore * availabilityWeight) +
		(normalizedQualityScore * qualityWeight) +
		(normalizedExpScore * urgencyWeight)

	return finalScore
}