import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchState {
  searchValue: string;
  startDate: string;
  expDate: string;
  itemType: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  setSearchValue: (value: string) => void;
  setDateFilter: (start: string, exp: string) => void;
  setItemType: (value: string) => void;
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void;
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
      sortBy: "",
      sortOrder: "asc",
      setSearchValue: (value) => set({ searchValue: value }),
      setDateFilter: (start, exp) => set({ startDate: start, expDate: exp }),
      setItemType: (value) => set({ itemType: value }),
      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
      clearSearchValue: () => set({ searchValue: "" }),
      clearItemType: () => set({ itemType: "" }),
      clearAllFilters: () =>
        set({
          searchValue: "",
          startDate: "",
          expDate: "",
          sortBy: "",
          sortOrder: "asc",
        }),
    }),
    {
      name: "search-storage", // key in sessionStorage
    }
  )
);