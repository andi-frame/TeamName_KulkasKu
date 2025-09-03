"use client";

import { useRecipeStore } from "@/store/useRecipeStore";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { IngredientsAvailability } from "@/components/recipe/ingredients-availability";
import { toast } from "sonner";
import api from "@/utils/axios";

const Page = () => {
  const router = useRouter();
  const { recipeDetail, setRecipeDetail } = useRecipeStore();

  useEffect(() => {
    const startTime = Date.now();

    return () => {
      if (recipeDetail) {
        const duration = Math.round((Date.now() - startTime) / 1000); // in seconds

        if (duration < 3) return; // Ignore short views

        const activityData = {
          ...recipeDetail,
          activityType: "view",
          viewDuration: duration,
        };

        api.post("/activity/recipe", activityData).catch((err) => {
          console.error("Failed to record view activity:", err);
        });
      }
    };
  }, [recipeDetail]);

  const handleBack = () => {
    setRecipeDetail(null); // Clear detail view when going back
    router.back();
  };

  const handleCookingComplete = async () => {
    if (!recipeDetail) return;

    const activityData = {
      ...recipeDetail,
      activityType: "cook",
      viewDuration: 0, // Not applicable for this event
    };

    try {
      await api.post("/activity/recipe", activityData);
      toast.success(
        `Resep "${recipeDetail?.title}" ditandai telah dimasak! Preferensi Anda telah diperbarui.`
      );
    } catch (error) {
      console.error("Failed to record cook activity:", error);
      toast.error("Gagal mencatat aktivitas memasak Anda.");
    }
  };

  if (!recipeDetail) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div
          className="flex pt-6 cursor-pointer items-center text-gray-600 hover:text-black"
          onClick={() => router.push("/recipe")}
        >
          <ChevronLeft /> <span>Kembali ke Daftar Resep</span>
        </div>
        <p className="text-center mt-8">
          Detail resep tidak ditemukan. Silakan pilih resep dari daftar.
        </p>
      </div>
    );
  }

  const {
    title,
    author,
    release_date,
    rating,
    cooking_time,
    price,
    serving_min,
    serving_max,
    description,
    ingredient_type,
    cooking_step,
    health_analysis,
    nutrition,
  } = recipeDetail;

  const formatDate = (unix: number) =>
    new Date(unix * 1000).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <>
      <div
        className="flex pt-6 cursor-pointer items-center text-gray-600 hover:text-black"
        onClick={handleBack}
      >
        <ChevronLeft /> <span>Kembali</span>
      </div>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-gray-600">By {author.name}</p>
          <p className="text-xs text-gray-500">📅 {formatDate(release_date)}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-bold text-lg">⭐ {rating.toFixed(1)}</p>
            <p className="text-xs text-gray-600">Rating</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-bold text-lg">⏱️ {cooking_time}</p>
            <p className="text-xs text-gray-600">Menit</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-bold text-lg">
              {serving_min}-{serving_max}
            </p>
            <p className="text-xs text-gray-600">Porsi</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-bold text-lg">
              {price > 0 ? `${price / 1000}K` : "Gratis"}
            </p>
            <p className="text-xs text-gray-600">Biaya</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mt-4">📌 Deskripsi</h2>
          <p className="text-sm text-gray-800 whitespace-pre-line">
            {description}
          </p>
        </div>

        {health_analysis && (
          <div className="bg-sky-50 border-l-4 border-sky-500 p-4 rounded-r-lg">
            <h2 className="text-lg font-semibold mb-2">💡 Analisis Kesehatan</h2>
            <p className="text-sm text-gray-800">{health_analysis}</p>
          </div>
        )}

        {nutrition && nutrition.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mt-4">📊 Informasi Gizi</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-center">
              {nutrition.map((item, index) => (
                <div key={index} className="bg-gray-100 p-3 rounded-lg">
                  <p className="font-bold text-md">
                    {item.amount}
                    {item.unit}
                  </p>
                  <p className="text-xs text-gray-600">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mt-4">🧂 Bahan-Bahan</h2>
          {ingredient_type && ingredient_type.length > 0 ? (
            <IngredientsAvailability
              ingredientTypes={ingredient_type}
              recipeName={title || "Recipe"}
            />
          ) : (
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-gray-600">Bahan-bahan tidak tersedia</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mt-4">👨‍🍳 Cara Membuat</h2>
          <ol className="space-y-4 mt-2">
            {!!cooking_step &&
              cooking_step.map((step, i) => (
                <li
                  key={i}
                  className="rounded-lg p-4 border border-gray-200 flex gap-4 items-start"
                >
                  <div className="bg-blue-500 text-white rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold">
                    {step.order}
                  </div>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-gray-700">{step.text}</p>
                  </div>
                </li>
              ))}
          </ol>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleCookingComplete}
            className="bg-green-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-green-600 transition-colors shadow-md ring-1 ring-gray-200"
          >
            ✅ Tandai Sudah Dimasak
          </button>
        </div>
      </div>
    </>
  );
};

export default Page;