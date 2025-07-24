import { create } from "zustand";
import api from "@/utils/axios";

interface RecipeData {
  id: string;
  title: string;
  slug: string;
  cooking_time: number;
  calories: string;
  price: number;
  tags: Array<{ name: string }>;
}

interface RecipeTrackingState {
  viewStartTime: number | null;
  currentRecipe: RecipeData | null;

  // Actions
  trackInteraction: (
    recipeId: string,
    activityType: "view" | "detail_view" | "cooked",
    viewDuration?: number,
    recipeData?: RecipeData
  ) => Promise<void>;
  trackRecipeClick: (recipe: RecipeData) => void;
  trackDetailPageEnter: (recipe: RecipeData) => void;
  trackDetailPageExit: () => void;
  trackCookingComplete: (recipe: RecipeData) => void;
  resetTracking: () => void;
}

export const useRecipeTrackingStore = create<RecipeTrackingState>((set, get) => ({
  viewStartTime: null,
  currentRecipe: null,

  trackInteraction: async (recipeId, activityType, viewDuration = 0, recipeData) => {
    try {
      await api.post("/recipe/track", {
        recipe_id: recipeId,
        activity_type: activityType,
        view_duration: viewDuration,
        recipe_data: recipeData,
      });
    } catch (error) {
      console.error("Failed to track recipe interaction:", error);
    }
  },

  trackRecipeClick: (recipe) => {
    const { trackInteraction } = get();
    trackInteraction(recipe.id, "view", 0, recipe);
  },

  trackDetailPageEnter: (recipe) => {
    set({
      viewStartTime: Date.now(),
      currentRecipe: recipe,
    });
  },

  trackDetailPageExit: () => {
    const { viewStartTime, currentRecipe, trackInteraction, resetTracking } = get();

    if (viewStartTime && currentRecipe) {
      const duration = Math.floor((Date.now() - viewStartTime) / 1000);
      trackInteraction(currentRecipe.id, "detail_view", duration, currentRecipe);
    }

    resetTracking();
  },

  trackCookingComplete: (recipe) => {
    const { trackInteraction } = get();
    trackInteraction(recipe.id, "cooked", 0, recipe);
  },

  resetTracking: () => {
    set({
      viewStartTime: null,
      currentRecipe: null,
    });
  },
}));
