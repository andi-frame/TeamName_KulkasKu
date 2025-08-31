import { create } from "zustand";
import { RecipeDetail } from "@/types/recipe.types";

interface RecipeStore {
  recipes: RecipeDetail[];
  recipeDetail: RecipeDetail | null;
  setRecipes: (recipes: RecipeDetail[]) => void;
  setRecipeDetail: (detail: RecipeDetail | null) => void;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  recipes: [],
  recipeDetail: null,
  setRecipes: (recipes) => set({ recipes }),
  setRecipeDetail: (detail) => set({ recipeDetail: detail }),
}));