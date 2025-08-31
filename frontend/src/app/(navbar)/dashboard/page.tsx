"use client";

import { useState, useEffect } from "react";
import { BarChart3, Clock, AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { FoodCard } from "@/components/food-card";

import { Item } from "@/types/item.types";
import api from "@/utils/axios";

interface NutritionData {
  protein: number;
  calories: number;
  fat: number;
  carbs: number;
  sugar: number;
}

interface FoodItem {
  id: string;
  name: string;
  expiryDate: string;
  daysLeft: number;
}

interface FoodHistory {
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
  const [recentMeals, setRecentMeals] = useState<FoodHistory[]>([]);
  const [suggestedMenus, setSuggestedMenus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
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
          const formattedMeals = dashboardData.recent_meals.map((meal: any) => ({
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
          }));
          setRecentMeals(formattedMeals);
        }

        // Update suggested menus
        if (dashboardData.next_meal_suggestions) {
          setSuggestedMenus(dashboardData.next_meal_suggestions);
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
        setSuggestedMenus(["Chicken Stir Fry with Vegetables", "Greek Yogurt Parfait", "Quinoa Buddha Bowl"]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const [expiringItems, setExpiringItems] = useState<FoodItem[]>([
    { id: "1", name: "Milk", expiryDate: "2025-01-15", daysLeft: 2 },
    { id: "2", name: "Chicken Breast", expiryDate: "2025-01-16", daysLeft: 3 },
    { id: "3", name: "Yogurt", expiryDate: "2025-01-14", daysLeft: 1 },
  ]);

  const nutritionTargets = {
    protein: 50,
    calories: 2000,
    fat: 70,
    carbs: 250,
    sugar: 50,
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const [isIngredientsPanelOpen, setIsIngredientsPanelOpen] = useState<boolean>(false);

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
                  <h2 className="text-xl font-semibold">Today's Nutrition</h2>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(nutrition).map(([key, value]) => ({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        current: getProgressPercentage(value, nutritionTargets[key as keyof NutritionData]),
                        target: 100,
                        actualCurrent: value,
                        actualTarget: nutritionTargets[key as keyof NutritionData],
                      }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        formatter={(value: number, name: string, props: any) => {
                          if (name === "current") {
                            return [
                              `${props.payload.actualCurrent}${
                                props.payload.actualCurrent === nutrition.calories ? " kcal" : " g"
                              } (${value.toFixed(1)}%)`,
                              "Current",
                            ];
                          }
                          return [
                            `${props.payload.actualTarget}${
                              props.payload.actualTarget === nutritionTargets.calories ? " kcal" : " g"
                            }`,
                            "Target",
                          ];
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

            {/* Suggested Menus */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Suggested Menus</h2>
              <div className="space-y-3">
                {suggestedMenus.map((menu, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <p className="font-medium text-gray-900">{menu}</p>
                    <p className="text-sm text-gray-600">Based on your available ingredients</p>
                  </div>
                ))}
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
