"use client";

import { useRecipeStore } from "@/store/useRecipeStore";
import { RecipeDetail } from "@/types/recipe.types";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  recipe: RecipeDetail;
};

const RecipeCard: React.FC<Props> = ({ recipe }) => {
  const router = useRouter();
  const { setRecipeDetail } = useRecipeStore();

  const handleRecipeOnClick = () => {
    setRecipeDetail(recipe);
    router.push("/recipe/detail");
  };

  return (
    <div className="rounded-lg p-4 shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col" onClick={handleRecipeOnClick}>
      <div className="flex-grow">
        <h2 className="text-md font-bold text-gray-800 line-clamp-2">{recipe.title}</h2>
        <p className="text-xs text-gray-600 mt-1">By {recipe.author.name}</p>
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          <p>⭐ {recipe.rating.toFixed(1)} / 5</p>
          <p>⏱️ {recipe.cooking_time} min</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {recipe.tags?.slice(0, 3).map((tag, index) => (
          <span key={index} className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RecipeCard;