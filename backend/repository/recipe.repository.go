package repository

import (
	"encoding/json"

	"github.com/andi-frame/TeamName_KulkasKu/backend/database"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func GetGeneratedRecipesByUserID(userID uuid.UUID) ([]schema.RecipeDetail, error) {
	var generatedRecipe schema.GeneratedRecipe
	if err := database.DB.Where("user_id = ?", userID).First(&generatedRecipe).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return []schema.RecipeDetail{}, nil // Return empty slice if no record found
		}
		return nil, err
	}

	var recipes []schema.RecipeDetail
	if err := json.Unmarshal(generatedRecipe.Recipes, &recipes); err != nil {
		return nil, err
	}

	return recipes, nil
}

func UpsertGeneratedRecipes(userID uuid.UUID, recipes []schema.RecipeDetail) error {
	recipesJSON, err := json.Marshal(recipes)
	if err != nil {
		return err
	}

	generatedRecipe := schema.GeneratedRecipe{
		UserID:  userID,
		Recipes: recipesJSON,
	}

	return database.DB.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "user_id"}}, UpdateAll: true}).Create(&generatedRecipe).Error
}
