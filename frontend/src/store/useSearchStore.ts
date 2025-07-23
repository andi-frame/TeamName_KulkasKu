import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchState {
  searchValue: string;
  setSearchValue: (value: string) => void;
  clearSearchValue: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      searchValue: "",
      setSearchValue: (value) => set({ searchValue: value }),
      clearSearchValue: () => set({ searchValue: "" }),
    }),
    {
      name: "search-storage", // key in sessionStorage
    }
  )
);