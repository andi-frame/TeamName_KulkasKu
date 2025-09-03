import { toast } from "sonner";

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};

export const getMealTypeLabel = (type: string) => {
  const labels = {
    breakfast: "Sarapan",
    lunch: "Makan Siang",
    dinner: "Makan Malam",
    snack: "Snack/Camilan",
  };
  return labels[type as keyof typeof labels] || type;
};

export const getFeelingIcon = (feeling: string) => {
  const icons = {
    hungry: "😋",
    very_hungry: "🤤",
    normal: "😐",
    full: "😊",
    satisfied: "😌",
    still_hungry: "😕",
  };
  return icons[feeling as keyof typeof icons] || "😐";
};

export const handleApiError = (error: any, defaultMessage: string) => {
  console.error(error);
  const errorMessage = error.response?.data?.error || defaultMessage;
  toast.error(errorMessage);
};

export const calculateNutrition = (journals: any[]) => {
  return journals.reduce(
    (acc, journal) => ({
      calories: acc.calories + (journal.ai_nutrition?.calories || 0),
      protein: acc.protein + (journal.ai_nutrition?.protein || 0),
      carbs: acc.carbs + (journal.ai_nutrition?.carbs || 0),
      fat: acc.fat + (journal.ai_nutrition?.fat || 0),
      sugar: acc.sugar + (journal.ai_nutrition?.sugar || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 }
  );
};
