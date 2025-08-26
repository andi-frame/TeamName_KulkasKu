"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";

export const Step3 = () => {
  const { formData, setFormData, setStep } = useOnboardingStore();

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Aktivitas Harian</h2>
      <p className="mb-4 text-sm sm:text-base">Pilih tingkat aktivitas harian Anda.</p>
      <select
        value={formData.dailyActivity}
        onChange={(e) => setFormData({ dailyActivity: e.target.value })}
        className="w-full px-4 py-2 border rounded-md"
      >
        <option value="">Pilih aktivitas</option>
        <option value="sedentary">Sedentary (jarang olahraga)</option>
        <option value="lightly_active">Lightly Active (olahraga 1-3 hari/minggu)</option>
        <option value="moderately_active">Moderately Active (olahraga 3-5 hari/minggu)</option>
        <option value="very_active">Very Active (olahraga 6-7 hari/minggu)</option>
      </select>
      <div className="flex flex-col sm:flex-row justify-between mt-6">
        <button onClick={() => setStep(2)} className="w-full sm:w-auto bg-gray-300 text-black py-2 px-6 rounded-md mb-2 sm:mb-0">
          Kembali
        </button>
        <button onClick={() => setStep(4)} className="w-full sm:w-auto bg-[#5EB1FF] text-white py-2 px-6 rounded-md">
          Lanjut
        </button>
      </div>
    </div>
  );
};
