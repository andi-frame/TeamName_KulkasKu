import { Recipe } from "@/types/recipe.types";
import Image from "next/image";
import React from "react";

type Props = {
  recipe: Recipe;
};

// TODO: implement call for real price
const RecipeCard: React.FC<Props> = ({ recipe }) => {
  return (
    <div className="rounded p-4 shadow max-w-sm">
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
        {recipe.cooking_time} min • ⭐ {recipe.rating}
        {recipe.price > 0 ? ` • Rp ${recipe.price}` : ""}
      </p>
    </div>
  );
};

export default RecipeCard;
