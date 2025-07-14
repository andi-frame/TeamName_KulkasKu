import { create } from 'zustand'
import { foodCategory } from '@/types/foodCategory';

interface MenuBarOption {
    selected: foodCategory;
    setSelected: ( foodCategory: foodCategory ) => void;
}

export const useMenuBarOption = create<MenuBarOption>(
    (set) => ({
        selected: 'Semua',
        setSelected: (foodCategory) => set({ selected: foodCategory})
    })
)