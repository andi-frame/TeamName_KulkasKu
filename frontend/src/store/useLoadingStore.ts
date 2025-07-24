import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  setLoading: (val: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  setLoading: (val) => set({ isLoading: val }),
}));