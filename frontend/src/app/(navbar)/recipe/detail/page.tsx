"use client";

import { useRecipeStore } from "@/store/useRecipeStore";
import { useRecipeTrackingStore } from "@/store/useRecipeTrackingStore";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  const { recipeDetail } = useRecipeStore();
  const { trackDetailPageEnter, trackDetailPageExit, trackCookingComplete, currentRecipe } = useRecipeTrackingStore();
  const [hasTrackedEntry, setHasTrackedEntry] = useState(false);

  // Track page entry
  useEffect(() => {
    if (recipeDetail && !hasTrackedEntry) {
      const recipeData = {
        id: recipeDetail.id || recipeDetail.slug,
        title: recipeDetail.title,
        slug: recipeDetail.slug,
        cooking_time: recipeDetail.cooking_time,
        calories: recipeDetail.calories || "0",
        price: recipeDetail.price,
        tags: recipeDetail.tags || [],
      };

      trackDetailPageEnter(recipeData);
      setHasTrackedEntry(true);
    }
  }, [recipeDetail, trackDetailPageEnter, hasTrackedEntry]);

  // Track page exit
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentRecipe) {
        trackDetailPageExit();
      }
    };

    const handleRouteChange = () => {
      if (currentRecipe) {
        trackDetailPageExit();
      }
    };

    // navigates away or closes tab
    window.addEventListener("beforeunload", handleBeforeUnload);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      handleRouteChange();
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      handleRouteChange();
      return originalReplaceState.apply(this, args);
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleRouteChange);

      // Restore original methods
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;

      // Final cleanup
      if (currentRecipe) {
        trackDetailPageExit();
      }
    };
  }, [trackDetailPageExit, currentRecipe]);

  const handleBack = () => {
    trackDetailPageExit();
    router.back();
  };

  const handleCookingComplete = () => {
    if (recipeDetail) {
      const recipeData = {
        id: recipeDetail.id || recipeDetail.slug,
        title: recipeDetail.title,
        slug: recipeDetail.slug,
        cooking_time: recipeDetail.cooking_time,
        calories: recipeDetail.calories || "0",
        price: recipeDetail.price,
        tags: recipeDetail.tags || [],
      };

      trackCookingComplete(recipeData);
    }
  };

  if (!recipeDetail)
    return (
      <>
        <div className="flex pt-6" onClick={handleBack}>
          <ChevronLeft /> <span>Kembali</span>
        </div>
        <p>No detail found</p>
      </>
    );

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
    cover_url,
    ingredient_type,
    cooking_step,
    share_link,
  } = recipeDetail;

  const formatDate = (unix: number) =>
    new Date(unix * 1000).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <>
      <div className="flex pt-6" onClick={handleBack}>
        <ChevronLeft /> <span>Kembali</span>
      </div>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <Image
          src={`https://cdn.yummy.co.id/${cover_url}`}
          width={600}
          height={315}
          alt={title}
          className="w-full rounded-lg object-cover"
        />

        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-gray-600">By {author.name}</p>
          <p className="text-xs text-gray-500">📅 {formatDate(release_date)}</p>
        </div>

        <div className="text-sm text-gray-700 space-y-1">
          <p>⭐ {rating} / 5</p>
          <p>⏱️ {cooking_time} menit</p>
          <p>
            👨‍👩‍👧‍👦 {serving_min} - {serving_max} porsi
          </p>
          {price > 0 && <p>💰 {price / 1000}K</p>}
        </div>

        <div>
          <h2 className="text-md font-semibold mt-4">📌 Deskripsi</h2>
          <p className="text-sm text-gray-800 whitespace-pre-line">{description}</p>
        </div>

        <div>
          <h2 className="text-md font-semibold mt-4">🧂 Bahan-Bahan</h2>
          {!!ingredient_type &&
            ingredient_type.map((group, i) => (
              <div key={i} className="mt-2">
                <p className="font-semibold text-sm">{group.name}</p>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {group.ingredients.map((item, idx) => (
                    <li key={idx}>{item.description}</li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        <div>
          <h2 className="text-md font-semibold mt-4">👨‍🍳 Cara Membuat</h2>
          <ol className="space-y-4 mt-2">
            {!!cooking_step &&
              cooking_step.map((step, i) => (
                <li key={i} className="rounded p-4 shadow-md ring-1 ring-gray-200 max-w-sm">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-gray-700">{step.text}</p>
                  {step.image_url && (
                    <Image
                      src={`https://cdn.yummy.co.id/${step.image_url}`}
                      alt={`Step ${step.order}`}
                      width={300}
                      height={300}
                      className="mt-2 rounded object-cover"
                    />
                  )}
                </li>
              ))}
          </ol>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleCookingComplete}
            className="bg-green-500 text-white px-2 py-1 text-sm rounded-lg hover:bg-green-600 transition-colors shadow-md ring-1 ring-gray-200">
            ✅ Klik Jika Sudah Dimasak
          </button>
        </div>

        <div className="mt-2">
          <a href={share_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
            🔗 Lebih Lengkap
          </a>
        </div>
      </div>
    </>
  );
};

export default Page;
