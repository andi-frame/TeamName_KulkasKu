"use client";

import { useState, useEffect } from "react";
import { BarChart3, Clock, AlertTriangle, ChefHat, Star, Users } from "lucide-react";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { FoodCard } from "@/components/food-card";

import { Item } from "@/types/item.types";
import api from "@/utils/axios";

import { useRecipeStore } from "@/store/useRecipeStore";
import { useRouter } from "next/navigation";
import { RecipeDetail } from "@/types/recipe.types";

interface NutritionData {
  protein: number;
  calories: number;
  fat: number;
  carbs: number;
  sugar: number;
}

interface RecentMeal {
  id: string;
  name: string;
  date: string;
  nutrition: NutritionData;
}

export default function Dashboard() {
  const [nutrition, setNutrition] = useState<NutritionData>({
    protein: 0,
    calories: 0,
    fat: 0,
    carbs: 0,
    sugar: 0,
  });

  const [ingredients, setIngredients] = useState<Item[]>([]);
  const [recentMeals, setRecentMeals] = useState<RecentMeal[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<RecipeDetail[]>([]);
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);

  const router = useRouter();
  const { setRecipeDetail } = useRecipeStore();

  useEffect(() => {
    const handleRecipeOnClick = () => {
      setRecipeDetail(recipe);
      router.push("/recipe/detail");
    };

    if (recipe) {
      handleRecipeOnClick();
    }
  }, [recipe, router, setRecipeDetail]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch fresh items
        const itemsResponse = await api.get("/item/fresh");
        setIngredients(itemsResponse.data.data || []);

        // Fetch food journal dashboard data
        const dashboardResponse = await api.get("/food-journal/dashboard");
        const dashboardData = dashboardResponse.data.data;

        // Update nutrition data
        if (dashboardData.today_nutrition) {
          setNutrition({
            protein: dashboardData.today_nutrition.protein || 0,
            calories: dashboardData.today_nutrition.calories || 0,
            fat: dashboardData.today_nutrition.fat || 0,
            carbs: dashboardData.today_nutrition.carbs || 0,
            sugar: dashboardData.today_nutrition.sugar || 0,
          });
        }

        // Update recent meals
        if (dashboardData.recent_meals) {
          const formattedMeals = dashboardData.recent_meals.map(
            (meal: { id: string; meal_name: string; created_at: string; ai_nutrition?: NutritionData }) => ({
              id: meal.id,
              name: meal.meal_name,
              date: new Date(meal.created_at).toLocaleDateString(),
              nutrition: {
                protein: meal.ai_nutrition?.protein || 0,
                calories: meal.ai_nutrition?.calories || 0,
                fat: meal.ai_nutrition?.fat || 0,
                carbs: meal.ai_nutrition?.carbs || 0,
                sugar: meal.ai_nutrition?.sugar || 0,
              },
            })
          );
          setRecentMeals(formattedMeals);
        }

        // Update suggested recipes
        if (dashboardData.next_meal_suggestions && Array.isArray(dashboardData.next_meal_suggestions)) {
          setSuggestedRecipes(dashboardData.next_meal_suggestions);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback to default data if API fails
        setNutrition({
          protein: 45,
          calories: 1850,
          fat: 65,
          carbs: 225,
          sugar: 38,
        });
        setSuggestedRecipes([]);
      }
    };

    fetchDashboardData();
  }, []);

  const expiringItems = [
    { id: "1", name: "Milk", expiryDate: "2025-01-15", daysLeft: 2 },
    { id: "2", name: "Chicken Breast", expiryDate: "2025-01-16", daysLeft: 3 },
    { id: "3", name: "Yogurt", expiryDate: "2025-01-14", daysLeft: 1 },
  ];

  const nutritionTargets = {
    protein: 50, // 50g
    calories: 2000, // 2000 kcal
    fat: 70, // 70g
    carbs: 250, // 250g
    sugar: 50, // 50g
  };

  const getProgressPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return (current / target) * 100; // Remove the cap to show actual percentage
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 50) return "#3B82F6"; // Blue - under target
    if (percentage <= 100) return "#10B981"; // Green - near target
    if (percentage <= 150) return "#F59E0B"; // Yellow - over target
    return "#EF4444"; // Red - way over target
  };

  const [isIngredientsPanelOpen, setIsIngredientsPanelOpen] = useState<boolean>(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCaloriesFromNutrition = (nutrition: RecipeDetail["nutrition"]) => {
    const calorieInfo = nutrition.find((n) => n.name.toLowerCase().includes("kalori"));
    return calorieInfo ? calorieInfo.amount : "N/A";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="w-full bg-white shadow-md">
          <div className="max-w-7xl mx-4 p-4 md:p-6 lg:p-8">
            <div className="w-full inline-flex flex-col justify-start items-start">
              <div className="self-stretch inline-flex justify-between items-center">
                <div className="justify-start text-2xl font-semibold leading-snug">Dashboard</div>
                <button
                  onClick={() => setIsIngredientsPanelOpen(!isIngredientsPanelOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <span>Ingredients</span>
                  <div className={`transform transition-transform ${isIngredientsPanelOpen ? "rotate-180" : ""}`}>▼</div>
                </button>
              </div>
              <div className="text-gray-600">Track your nutrition and manage your kitchen</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Nutrition Overview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-[#50A2FF]" />
                  <h2 className="text-xl font-semibold">Today&apos;s Nutrition</h2>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(nutrition).map(([key, value]) => {
                        const target = nutritionTargets[key as keyof NutritionData];
                        const percentage = getProgressPercentage(value, target);
                        return {
                          name: key.charAt(0).toUpperCase() + key.slice(1),
                          current: Math.min(percentage, 200), // Cap display at 200% for chart readability
                          target: 100,
                          actualCurrent: value,
                          actualTarget: target,
                          actualPercentage: percentage,
                          color: getProgressColor(percentage),
                        };
                      })}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 200]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const unit = data.actualCurrent === nutrition.calories ? " kcal" : " g";
                            return (
                              <div className="bg-white p-3 border rounded shadow">
                                <p className="font-medium">{label}</p>
                                <p className="text-blue-600">
                                  Current: {data.actualCurrent}
                                  {unit} ({data.actualPercentage.toFixed(1)}%)
                                </p>
                                <p className="text-gray-600">
                                  Target: {data.actualTarget}
                                  {unit} (100%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="current" fill="#50A2FF" name="Current %" />
                      <Bar dataKey="target" fill="#e5e7eb" name="Target (100%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Expiring Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h2 className="text-xl font-semibold">Items Expiring Soon</h2>
              </div>
              <div className="space-y-3">
                {expiringItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.expiryDate}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.daysLeft <= 1 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {item.daysLeft} day{item.daysLeft !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">24</p>
              <p className="text-sm text-gray-600">Items in Fridge</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-green-600">18</p>
              <p className="text-sm text-gray-600">Meals This Week</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">3</p>
              <p className="text-sm text-gray-600">Items Expiring</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">92%</p>
              <p className="text-sm text-gray-600">Goal Achievement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Recent Meals */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Recent Meals</h2>
              </div>
              <div className="space-y-4">
                {recentMeals.map((meal) => (
                  <div key={meal.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-medium text-gray-900">{meal.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{meal.date}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <span>Calories: {meal.nutrition.calories}</span>
                      <span>Protein: {meal.nutrition.protein}g</span>
                      <span>Carbs: {meal.nutrition.carbs}g</span>
                      <span>Fat: {meal.nutrition.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Recipes */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <ChefHat className="h-5 w-5 text-green-500" />
                <h2 className="text-xl font-semibold">Suggested Recipes</h2>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {suggestedRecipes && suggestedRecipes.length > 0 ? (
                  suggestedRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      onClick={() => {
                        setRecipe(recipe);
                      }}
                      className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight">{recipe.title}</h3>
                        <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-700">{recipe.rating}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>

                      {recipe.health_analysis && (
                        <div className="mb-3 p-2 bg-green-100 rounded-md">
                          <p className="text-xs text-green-800 font-medium">Health Benefit:</p>
                          <p className="text-xs text-green-700">{recipe.health_analysis}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        {recipe.tags &&
                          recipe.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                              {tag.name}
                            </span>
                          ))}
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{recipe.cooking_time} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {recipe.serving_min}-{recipe.serving_max}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{formatPrice(recipe.price)}</div>
                          <div className="text-xs">{getCaloriesFromNutrition(recipe.nutrition)} kcal</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recipe suggestions available</p>
                    <p className="text-sm text-gray-400">Try adding more ingredients to get personalized recommendations</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients Panel */}
        <div
          className={`fixed top-0 right-0 h-full bg-white shadow-lg transition-transform duration-300 z-50 ${
            isIngredientsPanelOpen ? "translate-x-0" : "translate-x-full"
          } w-80`}>
          <div className="h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">My Ingredients</h2>
              <button onClick={() => setIsIngredientsPanelOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <FoodCard key={ingredient.ID || index} {...ingredient} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
