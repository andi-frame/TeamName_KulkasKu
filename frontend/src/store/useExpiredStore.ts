import { create } from 'zustand'

interface ExpiredState {
    isExpired: boolean
    setIsExpired: (expired: boolean) => void
}

export const useExpiredStore = create<ExpiredState>((set) => ({
    isExpired: false,
    setIsExpired: (expired: boolean) => set({ isExpired: expired }),
}))