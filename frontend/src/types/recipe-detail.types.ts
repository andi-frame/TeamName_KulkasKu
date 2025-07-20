/* eslint-disable @typescript-eslint/no-explicit-any */
import { Author, Category } from "./recipe.types";

export interface CookingStep {
  title: string;
  text: string;
  image_url: string;
  order: number;
  start_at: number;
  original_image: string;
}

export interface Ingredient {
  description: string;
  recommendation: string;
  brand: string;
  buy_url: string;
  media_url: string;
  recomendation_media_url: string;
  related_recipe: any | null;
}

export interface IngredientType {
  name: string;
  ingredients: Ingredient[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface RecipeDetail {
  id: string;
  title: string;
  slug: string;
  cover_url: string;
  cover_url_watermark: string;
  description: string;
  rating: number;
  video_url: string;
  price: number;
  price_premium: number;
  calories: string;
  is_cvc: boolean;
  cooking_time: number;
  serving_min: number;
  serving_max: number;
  release_date: number;
  updated_date: number;
  is_bookmark: boolean;
  is_editorial: boolean;
  rating_user: number;
  is_video: boolean;
  premium_content: boolean;
  brand_slug: string;
  ingredient_count: number;
  meta_title: string;
  meta_description: string;
  og_caption: string;
  og_title: string;
  og_description: string;
  og_media: string;
  rater_count: number;
  recook_count: number;
  original_image: string;
  share_link: string;
  category: Category;
  cooking_step: CookingStep[];
  tags: Tag[];
  tag_ingredients: Tag[];
  recipe_info: any[];
  author: Author;
  ingredient_type: IngredientType[];
  nutrition: any[];
  recook: any[];
  cooking_tool: any[];
  tips_and_trick: any[];
  purchase_detail: any[];
}
