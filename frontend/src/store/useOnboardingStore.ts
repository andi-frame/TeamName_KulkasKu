import { create } from "zustand";

interface OnboardingState {
  step: number;
  formData: {
    dailyFoodCost: number;
    height: number;
    weight: number;
    bmi: number;
    age: number;
    bloodSugar: number;
    cholesterol: number;
    bloodPressure: string;
    dailyActivity: string;
    healthTarget: string;
    fridgeCapacity: number;
    fridgeModel: string;
  };
  setStep: (step: number) => void;
  setFormData: (data: Partial<OnboardingState["formData"]>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  formData: {
    dailyFoodCost: 0,
    height: 0,
    weight: 0,
    bmi: 0,
    age: 0,
    bloodSugar: 0,
    cholesterol: 0,
    bloodPressure: "",
    dailyActivity: "",
    healthTarget: "",
    fridgeCapacity: 300, // Default to Kulkas 2 Pintu
    fridgeModel: "Kulkas 2 Pintu",
  },
  setStep: (step) => set({ step }),
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  reset: () =>
    set({
      step: 1,
      formData: {
        dailyFoodCost: 0,
        height: 0,
        weight: 0,
        bmi: 0,
        age: 0,
        bloodSugar: 0,
        cholesterol: 0,
        bloodPressure: "",
        dailyActivity: "",
        healthTarget: "",
        fridgeCapacity: 300,
        fridgeModel: "Kulkas 2 Pintu",
      },
    }),
}));
