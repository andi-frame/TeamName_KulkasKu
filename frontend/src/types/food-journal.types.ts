export interface AINutrition {
  Calories: number;
  Protein: number;
  Carbs: number;
  Fat: number;
  Sugar: number;
  Fiber: number;
  Sodium: number;
  Confidence: number;
}

export interface AIRecommendations {
  NextMealSuggestion: string;
  NutritionTips: string;
  MotivationalMessage: string;
}

export interface FoodJournal {
  ID: string;
  CreatedAt: string;
  MealName: string;
  MealType: string;
  Description: string;
  FeelingBefore: string;
  FeelingAfter: string;
  ImageURL: string;
  VoiceURL: string;
  TranscriptText: string;
  AINutrition: AINutrition;
  AIFeedback: string;
  AIRecommendations: AIRecommendations;
}
