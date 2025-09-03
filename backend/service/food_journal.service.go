package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/google/uuid"
)

type FoodJournalInput struct {
	ID             uuid.UUID
	UserID         uuid.UUID
	MealName       string
	MealType       string
	Description    string
	FeelingBefore  string
	FeelingAfter   string
	ImageURL       string
	InputType      string
	RawInput       string
	ProcessedInput string
	FoodAnalysis   string
	CreatedAt      string
}

func CreateNewFoodJournal(input FoodJournalInput) error {
	var createdAt time.Time
	var err error

	if input.CreatedAt == "" {
		loc, err := time.LoadLocation("Asia/Jakarta")
		if err != nil {
			createdAt = time.Now()
		} else {
			createdAt = time.Now().In(loc)
		}
	} else {
		loc, err := time.LoadLocation("Asia/Jakarta")
		if err != nil {
			loc = time.UTC
		}

		dateOnly, err := time.Parse("2006-01-02", input.CreatedAt)
		if err != nil {
			return errors.New("invalid created at date format")
		}

		now := time.Now().In(loc)

		createdAt = time.Date(
			dateOnly.Year(),
			dateOnly.Month(),
			dateOnly.Day(),
			now.Hour(),
			now.Minute(),
			now.Second(),
			now.Nanosecond(),
			loc,
		)
	}

	geminiService, err := NewGeminiService()
	if err != nil {
		return fmt.Errorf("failed to initialize Gemini service: %w", err)
	}

	var foodAnalysis *schema.FoodAnalysis
	var foodAnalysisJSON string

	if input.FoodAnalysis != "" {
		foodAnalysisJSON = input.FoodAnalysis
		err = json.Unmarshal([]byte(input.FoodAnalysis), &foodAnalysis)
		if err != nil {
			return fmt.Errorf("failed to parse provided food analysis: %w", err)
		}
	} else {
		switch input.InputType {
		case "text":
			analysisInput := input.ProcessedInput
			if analysisInput == "" {
				analysisInput = input.Description
			}
			foodAnalysis, err = geminiService.AnalyzeFoodFromText(analysisInput)
			if err != nil {
				return fmt.Errorf("failed to analyze food from text: %w", err)
			}
		default:
			analysisInput := input.ProcessedInput
			if analysisInput == "" {
				analysisInput = input.Description
			}
			if analysisInput != "" {
				foodAnalysis, err = geminiService.AnalyzeFoodFromText(analysisInput)
				if err != nil {
					return fmt.Errorf("failed to analyze food from text: %w", err)
				}
			}
		}

		if foodAnalysis != nil {
			analysisBytes, err := json.Marshal(foodAnalysis)
			if err != nil {
				return fmt.Errorf("failed to marshal food analysis: %w", err)
			}
			foodAnalysisJSON = string(analysisBytes)
		}
	}

	mealName := input.MealName
	if mealName == "" && foodAnalysis != nil && len(foodAnalysis.DetectedFoods) > 0 {
		var foodNames []string
		for _, food := range foodAnalysis.DetectedFoods {
			foodNames = append(foodNames, food.Name)
		}
		mealName = strings.Join(foodNames, ", ")
	}

	foodJournal := schema.FoodJournal{
		UserID:         input.UserID,
		MealName:       mealName,
		MealType:       input.MealType,
		Description:    input.Description,
		FeelingBefore:  input.FeelingBefore,
		FeelingAfter:   input.FeelingAfter,
		InputType:      input.InputType,
		RawInput:       input.RawInput,
		ProcessedInput: input.ProcessedInput,
		ImageURL:       input.ImageURL,
		FoodAnalysis:   foodAnalysisJSON,
		CreatedAt:      createdAt,
		UpdatedAt:      createdAt,
	}

	if foodAnalysis != nil {
		foodJournal.AINutrition = foodAnalysis.TotalNutrition
		foodJournal.AIFeedback = foodAnalysis.AnalysisText

		recommendations, err := geminiService.GenerateRecommendations(foodAnalysis, input.MealType, input.FeelingBefore, input.FeelingAfter)
		if err != nil {
			fmt.Printf("Warning: failed to generate recommendations: %v\n", err)
		} else {
			foodJournal.AIRecommendations = *recommendations
		}
	}

	return repository.CreateNewFoodJournal(foodJournal, input.UserID.String())
}

func UpdateFoodJournal(inputJournal schema.FoodJournal) error {
	return repository.UpdateFoodJournal(inputJournal)
}

func DeleteFoodJournal(journalID string) error {
	return repository.DeleteFoodJournal(journalID)
}
