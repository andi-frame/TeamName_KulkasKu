"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const conversionFactors: { [key: string]: number } = {
  liter: 1,
  "botol air 1.5L": 1.5,
  apel: 0.25,
  "kaleng susu": 0.4,
};

export const Step5 = () => {
  const { formData, setFormData, setStep } = useOnboardingStore();
  const [inputValue, setInputValue] = useState(formData.fridgeCapacity > 0 ? (formData.fridgeCapacity / conversionFactors[formData.fridgeCapacityUnit]).toString() : "");
  const router = useRouter();

  useEffect(() => {
    const value = Number(inputValue);
    if (!isNaN(value)) {
      const liters = value * conversionFactors[formData.fridgeCapacityUnit];
      setFormData({ fridgeCapacity: Math.round(liters * 100) / 100 });
    }
  }, [inputValue, formData.fridgeCapacityUnit, setFormData]);

  const handleSubmit = async () => {
    try {
      await api.post("/profile/onboarding", formData);
      router.push("/fridge");
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
    }
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Ukuran Kulkas Anda</h2>
      <p className="mb-4 text-sm sm:text-base">Untuk memberikan rekomendasi yang lebih baik, kami perlu mengetahui perkiraan ukuran kulkas Anda.</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
          placeholder="Contoh: 50"
        />
        <select
          value={formData.fridgeCapacityUnit}
          onChange={(e) => {
            setInputValue("");
            setFormData({ fridgeCapacityUnit: e.target.value, fridgeCapacity: 0 });
          }}
          className="px-4 py-2 border rounded-md"
        >
          <option value="liter">liter</option>
          <option value="botol air 1.5L">botol air 1.5L</option>
          <option value="apel">apel</option>
          <option value="kaleng susu">kaleng susu</option>
        </select>
      </div>
      <div className="flex flex-col sm:flex-row justify-between mt-6">
        <button onClick={() => setStep(4)} className="w-full sm:w-auto bg-gray-300 text-black py-2 px-6 rounded-md mb-2 sm:mb-0">
          Kembali
        </button>
        <button onClick={handleSubmit} className="w-full sm:w-auto bg-[#5EB1FF] text-white py-2 px-6 rounded-md">
          Selesai
        </button>
      </div>
    </div>
  );
};
