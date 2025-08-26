import { create } from 'zustand';

interface OnboardingState {
  step: number;
  formData: {
    dailyFoodCost: number;
    height: number;
    weight: number;
    bmi: number;
    dailyActivity: string;
    healthTarget: string;
    fridgeCapacity: number;
    fridgeCapacityUnit: string;
  };
  setStep: (step: number) => void;
  setFormData: (data: Partial<OnboardingState['formData']>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  formData: {
    dailyFoodCost: 0,
    height: 0,
    weight: 0,
    bmi: 0,
    dailyActivity: '',
    healthTarget: '',
    fridgeCapacity: 0,
    fridgeCapacityUnit: 'liter',
  },
  setStep: (step) => set({ step }),
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  reset: () => set({ step: 1, formData: { dailyFoodCost: 0, height: 0, weight: 0, bmi: 0, dailyActivity: '', healthTarget: '', fridgeCapacity: 0, fridgeCapacityUnit: 'liter' } }),
}));
