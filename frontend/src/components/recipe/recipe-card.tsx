"use client";

import { useRecipeStore } from "@/store/useRecipeStore";
import { Recipe, RecipeDetail } from "@/types/recipe.types";
import api from "@/utils/axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {
  recipe: Recipe;
};

const RecipeCard: React.FC<Props> = ({ recipe }) => {
  const router = useRouter();
  const { setRecipeDetail } = useRecipeStore();
  const [data, setData] = useState<RecipeDetail | null>(null);

  useEffect(() => {
    const getRecipeDetail = async () => {
      const res = await api.get(`/recipe/detail/${recipe.slug}`);
      setData(res.data);
    };
    getRecipeDetail();
  }, [recipe.slug, setRecipeDetail]);

  const handleRecipeOnClick = () => {
    if (data === null) return;
    setRecipeDetail(data);
    router.push("/recipe/detail");
  };

  if (data === null) return <div></div>;

  return (
    <div className="rounded p-4 shadow max-w-sm" onClick={handleRecipeOnClick}>
      <Image
        src={`https://cdn.yummy.co.id/${recipe.cover_url}`}
        height={100}
        width={100}
        alt={recipe.title}
        className="w-full h-28 object-cover rounded"
      />
      <h2 className="text-xs font-bold mt-2">{recipe.title}</h2>
      <p className="text-[9px] text-gray-600">By {recipe.author.name}</p>
      <p className="text-[9px] text-gray-600">
        ⭐ {recipe.rating}
        {data.price > 0 ? ` • 💰 ${data.price / 1000}K` : ""} • ⏱️ {recipe.cooking_time} min
      </p>
    </div>
  );
};

export default RecipeCard;
