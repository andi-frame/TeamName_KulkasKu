"use client";

import RecipeCard from "@/components/recipe/recipe-card";
import RecipeHeader from "@/components/recipe/recipe-header";
import { useRecipeStore } from "@/store/useRecipeStore";
import api from "@/utils/axios";
import React, { useEffect } from "react";

const Page = () => {
  const { recipes, setRecipes } = useRecipeStore();

  useEffect(() => {
    const getAllRecipes = async () => {
      const res = await api.get("/recipe/recommendations");
      setRecipes(res.data.data);
    };
    getAllRecipes();
  }, [setRecipes]);

  return (
    <>
      <div>
        <RecipeHeader />
        <div className="flex flex-wrap w-full">
          {recipes.map((recipe, index) => (
            <div key={recipe.id + index} className="w-1/2 p-2">
              <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Page;
