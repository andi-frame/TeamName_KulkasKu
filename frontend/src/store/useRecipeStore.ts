import { create } from "zustand";
import { Recipe, RecipeDetail } from "@/types/recipe.types";

interface RecipeStore {
  recipes: Recipe[];
  recipeDetail: RecipeDetail | null;
  loading: boolean;
  error: string | null;
  setRecipes: (recipes: Recipe[]) => void;
  setRecipeDetail: (detail: RecipeDetail) => void;
  clearRecipeDetail: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  recipes: [],
  recipeDetail: null,
  loading: false,
  error: null,
  setRecipes: (recipes) => set({ recipes }),
  setRecipeDetail: (detail) => set({ recipeDetail: detail }),
  clearRecipeDetail: () => set({ recipeDetail: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
