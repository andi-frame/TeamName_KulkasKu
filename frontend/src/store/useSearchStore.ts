import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchState {
  searchValue: string;
  startDate: string;
  expDate: string;
  itemType: string,
  setSearchValue: (value: string) => void;
  setDateFilter: (start: string, exp: string) => void;
  setItemType: (value: string) => void;
  clearSearchValue: () => void;
  clearAllFilters: () => void;
  clearItemType: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      searchValue: "",
      startDate: "",
      expDate: "",
      itemType: "",
      setSearchValue: (value) => set({ searchValue: value }),
      setDateFilter: (start, exp) => set({ startDate: start, expDate: exp }),
      setItemType: (value) => set({ itemType: value }),
      clearSearchValue: () => set({ searchValue: "" }),
      clearItemType: () => set({ itemType: "" }),
      clearAllFilters: () =>
        set({
          searchValue: "",
          startDate: "",
          expDate: "",
        }),
    }),
    {
      name: "search-storage", // key in sessionStorage
    }
  )
);