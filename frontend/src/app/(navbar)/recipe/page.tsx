"use client";

import { LoadingOverlay } from "@/components/loading-overlay";
import RecipeCard from "@/components/recipe/recipe-card";
import RecipeHeader from "@/components/recipe/recipe-header";
import { useLoadingStore } from "@/store/useLoadingStore";
import { useRecipeStore } from "@/store/useRecipeStore";
import api from "@/utils/axios";
import React, { useEffect } from "react";

const Page = () => {
  const { recipes, setRecipes } = useRecipeStore();
  const { isLoading, setLoading } = useLoadingStore();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/recipe/all`);
        setRecipes(res.data || []);
      } catch (e) {
        console.error(e);
        setRecipes([]); // Clear recipes on error
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [setLoading, setRecipes]);

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <div>
        <RecipeHeader />
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 pt-4">
          {recipes && recipes.length > 0 ? (
            recipes.map((recipe, index) => (
              <div key={recipe.id + index} className="w-full">
                <RecipeCard recipe={recipe} />
              </div>
            ))
          ) : (
            !isLoading && <p className="col-span-full text-center text-gray-500">Tidak ada resep yang ditemukan. Coba lagi nanti.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;