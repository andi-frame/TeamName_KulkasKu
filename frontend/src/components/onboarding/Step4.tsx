"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";

export const Step4 = () => {
  const { formData, setFormData, setStep } = useOnboardingStore();

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Target Kesehatan</h2>
      <p className="mb-4 text-sm sm:text-base">Apa target kesehatan Anda?</p>
      <select
        value={formData.healthTarget}
        onChange={(e) => setFormData({ healthTarget: e.target.value })}
        className="w-full px-4 py-2 border rounded-md"
      >
        <option value="">Pilih target</option>
        <option value="weight_loss">Menurunkan berat badan</option>
        <option value="weight_gain">Menaikkan berat badan</option>
        <option value="maintain_weight">Menjaga berat badan</option>
      </select>
      <div className="flex flex-col sm:flex-row justify-between mt-6">
        <button onClick={() => setStep(3)} className="w-full sm:w-auto bg-gray-300 text-black py-2 px-6 rounded-md mb-2 sm:mb-0">
          Kembali
        </button>
        <button onClick={() => setStep(5)} className="w-full sm:w-auto bg-[#5EB1FF] text-white py-2 px-6 rounded-md">
          Lanjut
        </button>
      </div>
    </div>
  );
};
