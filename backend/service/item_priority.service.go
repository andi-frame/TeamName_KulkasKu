package service

import (
	"math"
	"sort"
	"strings"
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/andi-frame/TeamName_KulkasKu/backend/utils"
)

type ItemPriority struct {
	Name     string
	Priority float64
}

func (s *RecommendationService) buildSearchKeywords(items []schema.Item) string {
	if len(items) == 0 {
		return ""
	}

	// Group items by category/type if avail
	itemPriorities := make([]ItemPriority, 0, len(items))
	now := time.Now()

	// Max quantity for normalization
	maxQuantity := 1.0
	for _, item := range items {
		if float64(item.Amount) > maxQuantity {
			maxQuantity = float64(item.Amount)
		}
	}

	for _, item := range items {
		if item.Amount <= 0 {
			continue
		}

		priority := s.calculateItemPriority(item, now, maxQuantity)
		itemPriorities = append(itemPriorities, ItemPriority{
			Name:     strings.ToLower(item.Name),
			Priority: priority,
		})
	}

	// Sort by priority (highest first)
	sort.Slice(itemPriorities, func(i, j int) bool {
		return itemPriorities[i].Priority > itemPriorities[j].Priority
	})

	// Extract top keywords
	keywords := s.selectOptimalKeywords(itemPriorities, 5)

	return strings.Join(keywords, "-")
}

// Calculate priority with dynamic quantity normalization
func (s *RecommendationService) calculateItemPriority(item schema.Item, now time.Time, maxQuantity float64) float64 {
	priority := 0.0

	// 1. Expiry/urgency score (60% weight)
	daysUntilExpiry := item.ExpDate.Sub(now).Hours() / 24

	var expiryScore float64
	switch {
	case daysUntilExpiry <= 0:
		expiryScore = 1.0 // Expired
	case daysUntilExpiry <= 0.5:
		expiryScore = 0.95 // Expires today
	case daysUntilExpiry <= 1:
		expiryScore = 0.9 // Expires within 1 day
	case daysUntilExpiry <= 2:
		expiryScore = 0.8 // Expires within 2 days
	case daysUntilExpiry <= 3:
		expiryScore = 0.7 // Expires within 3 days
	case daysUntilExpiry <= 5:
		expiryScore = 0.6 // Expires within 5 days
	case daysUntilExpiry <= 7:
		expiryScore = 0.4 // Expires within a week
	case daysUntilExpiry <= 14:
		expiryScore = 0.2 // Expires within 2 weeks
	default:
		expiryScore = 0.1 // Expires later
	}

	priority += expiryScore * 0.6

	// 2. Quantity score (40% weight)
	quantityScore := float64(item.Amount) / maxQuantity
	priority += quantityScore * 0.4

	return priority
}

// Select optimal keywords (unique)
func (s *RecommendationService) selectOptimalKeywords(itemPriorities []ItemPriority, maxKeywords int) []string {
	keywords := make([]string, 0, maxKeywords)
	used := make(map[string]bool)

	for _, item := range itemPriorities {
		if len(keywords) >= maxKeywords {
			break
		}

		// Avoid very similar keywords
		itemName := item.Name
		similar := false

		for usedKeyword := range used {
			// Check if current item is too similar
			if s.isSimilarItem(itemName, usedKeyword) {
				similar = true
				break
			}
		}

		if !similar {
			keywords = append(keywords, itemName)
			used[itemName] = true
		}
	}

	// If don't have enough diverse keywords, fill with highest priority remaining items
	if len(keywords) < maxKeywords {
		for _, item := range itemPriorities {
			if len(keywords) >= maxKeywords {
				break
			}
			if !used[item.Name] {
				keywords = append(keywords, item.Name)
				used[item.Name] = true
			}
		}
	}

	return keywords
}

// fuzzy matching
func (s *RecommendationService) isSimilarItem(item1, item2 string) bool {
	if len(item1) < 2 || len(item2) < 2 {
		return false
	}

	// Normalize strings
	s1 := strings.ToLower(strings.TrimSpace(item1))
	s2 := strings.ToLower(strings.TrimSpace(item2))

	// Exact match
	if s1 == s2 {
		return true
	}

	// Levenshtein distance-based similarity
	similarity := s.calculateStringSimilarity(s1, s2)

	return similarity > 0.7
}

// Calculate string similarity using Levenshtein distance
func (s *RecommendationService) calculateStringSimilarity(s1, s2 string) float64 {
	if s1 == s2 {
		return 1.0
	}

	len1, len2 := len(s1), len(s2)
	if len1 == 0 {
		return 0.0
	}
	if len2 == 0 {
		return 0.0
	}

	maxLen := max(len2, len1)
	distance := s.levenshteinDistance(s1, s2)
	similarity := 1.0 - (float64(distance) / float64(maxLen))

	return math.Max(0.0, similarity)
}

// Levenshtein distance impl
func (s *RecommendationService) levenshteinDistance(s1, s2 string) int {
	len1, len2 := len(s1), len(s2)

	// Matrix to store distances
	matrix := make([][]int, len1+1)
	for i := range matrix {
		matrix[i] = make([]int, len2+1)
	}

	// Init
	for i := 0; i <= len1; i++ {
		matrix[i][0] = i
	}
	for j := 0; j <= len2; j++ {
		matrix[0][j] = j
	}

	// Fill the matrix
	for i := 1; i <= len1; i++ {
		for j := 1; j <= len2; j++ {
			cost := 0
			if s1[i-1] != s2[j-1] {
				cost = 1
			}

			matrix[i][j] = utils.Min3(
				matrix[i-1][j]+1,      // deletion
				matrix[i][j-1]+1,      // insertion
				matrix[i-1][j-1]+cost, // substitution
			)
		}
	}

	return matrix[len1][len2]
}
