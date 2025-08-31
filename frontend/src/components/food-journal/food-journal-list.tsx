"use client";

import React from "react";
import { FoodJournal } from "@/types/food-journal.types";

interface FoodJournalListProps {
  foodJournals: FoodJournal[];
}

const FoodJournalList: React.FC<FoodJournalListProps> = ({ foodJournals }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Your Food Journals</h2>
      {foodJournals.length === 0 ? (
        <p>No food journals yet.</p>
      ) : (
        <ul>
          {foodJournals.map((journal) => (
            <li key={journal.ID} className="p-4 border rounded-lg shadow-md mb-4">
              <h3 className="text-lg font-bold">{journal.MealName}</h3>
              <p className="text-sm text-gray-500">{new Date(journal.CreatedAt).toLocaleString()}</p>
              <p>
                <strong>Meal Type:</strong> {journal.MealType}
              </p>
              <p>
                <strong>Description:</strong> {journal.Description}
              </p>
              <p>
                <strong>Feeling Before:</strong> {journal.FeelingBefore}
              </p>
              <p>
                <strong>Feeling After:</strong> {journal.FeelingAfter}
              </p>
              {journal.TranscriptText && (
                <p>
                  <strong>Transcript:</strong> {journal.TranscriptText}
                </p>
              )}
              {journal.AINutrition && (
                <div className="mt-2 p-2 border-t">
                  <h4 className="font-bold">AI Nutrition Analysis</h4>
                  <p>Calories: {journal.AINutrition.Calories.toFixed(2)}</p>
                  <p>Protein: {journal.AINutrition.Protein.toFixed(2)}g</p>
                  <p>Carbs: {journal.AINutrition.Carbs.toFixed(2)}g</p>
                  <p>Fat: {journal.AINutrition.Fat.toFixed(2)}g</p>
                </div>
              )}
              {journal.AIFeedback && (
                <div className="mt-2 p-2 border-t">
                  <h4 className="font-bold">AI Feedback</h4>
                  <p>{journal.AIFeedback}</p>
                </div>
              )}
              {journal.AIRecommendations && (
                <div className="mt-2 p-2 border-t">
                  <h4 className="font-bold">AI Recommendations</h4>
                  <p>{journal.AIRecommendations.NextMealSuggestion}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FoodJournalList;
