"use client";

import { LoadingOverlay } from "@/components/loading-overlay";
import RecipeCard from "@/components/recipe/recipe-card";
import RecipeHeader from "@/components/recipe/recipe-header";
import { useLoadingStore } from "@/store/useLoadingStore";
import { useRecipeStore } from "@/store/useRecipeStore";
import api from "@/utils/axios";
import React, { useEffect, useState } from "react";

const Page = () => {
  const { recipes, setRecipes } = useRecipeStore();
  const { isLoading, setLoading } = useLoadingStore();
  const [limit, setLimit] = useState<number>(10);

  const fetchRecipes = async (limitValue: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/recipe/recommendations?limit=${limitValue}`);
      setRecipes(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(limit);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (limit > 0 && limit <= 50) {
      fetchRecipes(limit);
    } else {
      alert("Limit must be between 1 and 50.");
    }
  };

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <div>
        <RecipeHeader />
        <form onSubmit={handleSubmit} className="flex text-xs items-center gap-2 pt-1 pb-2 px-2">
          <label htmlFor="limit" className="font-medium">
            Limit:
          </label>
          <input
            id="limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border border-gray-300 rounded py-1 px-2 w-20"
            min={1}
            max={50}
          />
          <button type="submit" className="bg-blue-400 text-white px-2 py-1 rounded hover:bg-blue-500">
            Apply
          </button>
        </form>
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
