
/**
 * Food Category
 */
export const foodCategories = ["Semua", "Sayuran", "Daging", "Bumbu"] as const;

export type foodCategory = (typeof foodCategories)[number];