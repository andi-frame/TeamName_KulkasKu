"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";

export const Step1 = () => {
  const { formData, setFormData, setStep } = useOnboardingStore();

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Biaya Makanan Harian</h2>
      <p className="mb-4 text-sm sm:text-base">Berapa rata-rata biaya yang Anda keluarkan untuk makanan setiap hari? (dalam Rupiah)</p>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rp</span>
        <input
          type="number"
          value={formData.dailyFoodCost || ''}
          onChange={(e) => setFormData({ dailyFoodCost: Number(e.target.value) })}
          className="w-full pl-10 pr-4 py-2 border rounded-md"
          placeholder="Contoh: 50000"
        />
      </div>
      <button onClick={() => setStep(2)} className="mt-6 w-full sm:w-auto sm:float-right bg-[#5EB1FF] text-white py-2 px-6 rounded-md">
        Lanjut
      </button>
    </div>
  );
};
