
/**
 * Food Category
 */
export const foodCategories = ["Semua", "Sayuran", "Daging", "Bumbu", "Lainnya"] as const;

export type foodCategory = (typeof foodCategories)[number];