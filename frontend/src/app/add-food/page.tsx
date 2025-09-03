"use client";

import { useState, useEffect } from "react";
import { Plus, Clock, Heart, ChevronLeft, Eye, Brain } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/utils/axios";
import { FoodJournal } from "@/types/food-journal.types";
import { formatDate, calculateNutrition, handleApiError } from "@/utils/food-journal.utils";
import FoodJournalForm from "@/components/food-journal/food-journal-form";

const FoodJournalPage = () => {
  const [foodJournals, setFoodJournals] = useState<FoodJournal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [todayNutrition, setTodayNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
  });

  const loadFoodJournals = async () => {
    try {
      setLoading(true);
      const response = await api.get("/food-journal/today");
      const journals = response.data.data || [];
      setFoodJournals(journals);

      // Calculate nutrition using utility function
      const nutrition = calculateNutrition(journals);
      setTodayNutrition(nutrition);
    } catch (error) {
      handleApiError(error, "Gagal memuat data jurnal makanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoodJournals();
  }, []);

  const handleFoodJournalCreated = () => {
    loadFoodJournals();
    setShowForm(false);
    toast.success("Jurnal makanan berhasil ditambahkan!");
  };

  const formatTime = formatDate;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat jurnal makanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/fridge" className="flex gap-1 items-center">
              <ChevronLeft size={24} strokeWidth={1.5} />
              <span className="text-lg font-medium">Jurnal Makanan</span>
            </Link>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Today's Nutrition Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Brain className="h-5 w-5 text-blue-500 mr-2" />
            Nutrisi Hari Ini
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{Math.round(todayNutrition.calories)}</div>
              <div className="text-sm text-gray-600">Kalori</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{Math.round(todayNutrition.protein)}g</div>
              <div className="text-sm text-gray-600">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{Math.round(todayNutrition.carbs)}g</div>
              <div className="text-sm text-gray-600">Karbo</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-500">{Math.round(todayNutrition.fat)}g</div>
              <div className="text-sm text-gray-600">Lemak</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-pink-500">{Math.round(todayNutrition.sugar)}g</div>
              <div className="text-sm text-gray-600">Gula</div>
            </div>
          </div>
        </div>

        {/* Add Food Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Tambah Makanan</h3>
            <FoodJournalForm onFoodJournalCreated={handleFoodJournalCreated} />
          </div>
        )}

        {/* Today's Meals */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 text-green-500 mr-2" />
              Makanan Hari Ini
            </h2>
          </div>

          {foodJournals.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-4">
                <Heart className="h-12 w-12 mx-auto mb-2" />
              </div>
              <p className="text-gray-600 mb-4">Belum ada makanan yang dicatat hari ini</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Tambah Makanan Pertama
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {foodJournals.map((journal, index) => (
                <div key={journal.id || `journal-${index}`} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{journal.meal_name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{journal.meal_type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{formatTime(journal.created_at)}</span>
                      <Link
                        href={`/add-food/${journal.id}`}
                        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                        title="Lihat Detail">
                        <Eye size={16} />
                      </Link>
                    </div>
                  </div>

                  {journal.description && <p className="text-gray-700 mb-3 text-sm">{journal.description}</p>}

                  {journal.ai_nutrition && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm">📊 Nutrition Facts</h4>
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-orange-600">{Math.round(journal.ai_nutrition.calories)}</div>
                          <div className="text-gray-600">kcal</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-red-600">{Math.round(journal.ai_nutrition.protein)}g</div>
                          <div className="text-gray-600">protein</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{Math.round(journal.ai_nutrition.carbs)}g</div>
                          <div className="text-gray-600">karbo</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{Math.round(journal.ai_nutrition.fat)}g</div>
                          <div className="text-gray-600">lemak</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-pink-600">{Math.round(journal.ai_nutrition.sugar)}g</div>
                          <div className="text-gray-600">gula</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {journal.ai_recommendations?.next_meal_suggestion && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        💡 <strong>Saran:</strong> {journal.ai_recommendations.next_meal_suggestion}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 Tips Jurnal Makanan:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Catat makanan segera setelah makan untuk akurasi yang lebih baik</li>
            <li>• Gunakan fitur suara untuk input deskripsi yang lebih cepat</li>
            <li>• Sertakan perasaan Anda untuk analisis yang lebih personal</li>
            <li>• AI akan menganalisis makanan dan memberikan insight nutrisi</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FoodJournalPage;
