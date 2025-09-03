export interface AINutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
  sodium: number;
  confidence: number;
}

export interface AIRecommendations {
  next_meal_suggestion: string;
  nutrition_tips: string;
  motivational_message: string;
}

export interface FoodJournal {
  id: string; // Changed from ID to id to match backend response
  created_at: string;
  meal_name: string;
  meal_type: string;
  description: string;
  feeling_before: string;
  feeling_after: string;
  input_type: string;
  raw_input: string;
  processed_input: string;
  ai_nutrition: AINutrition;
  ai_feedback: string;
  ai_recommendations: AIRecommendations;
}
