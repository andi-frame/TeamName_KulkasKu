"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useEffect } from "react";

export const Step2 = () => {
  const { formData, setFormData, setStep } = useOnboardingStore();

  useEffect(() => {
    if (formData.height > 0 && formData.weight > 0) {
      const heightInMeters = formData.height / 100;
      const bmi = formData.weight / (heightInMeters * heightInMeters);
      setFormData({ bmi: Math.round(bmi * 10) / 10 });
    }
  }, [formData.height, formData.weight, setFormData]);

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Data Kesehatan</h2>
      <p className="mb-4 text-sm sm:text-base">Masukkan data kesehatan Anda.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-2 text-sm sm:text-base">Umur</label>
          <input
            type="number"
            value={formData.age || ""}
            onChange={(e) => setFormData({ age: Number(e.target.value) })}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Contoh: 25"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm sm:text-base">Tinggi Badan (cm)</label>
          <input
            type="number"
            value={formData.height || ""}
            onChange={(e) => setFormData({ height: Number(e.target.value) })}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Contoh: 170"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm sm:text-base">Berat Badan (kg)</label>
          <input
            type="number"
            value={formData.weight || ""}
            onChange={(e) => setFormData({ weight: Number(e.target.value) })}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Contoh: 65"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm sm:text-base">Gula Darah (mg/dL)</label>
          <input
            type="number"
            value={formData.bloodSugar || ""}
            onChange={(e) => setFormData({ bloodSugar: Number(e.target.value) })}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Contoh: 90"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm sm:text-base">Kolesterol (mg/dL)</label>
          <input
            type="number"
            value={formData.cholesterol || ""}
            onChange={(e) => setFormData({ cholesterol: Number(e.target.value) })}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Contoh: 150"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm sm:text-base">Tekanan Darah</label>
          <input
            type="text"
            value={formData.bloodPressure || ""}
            onChange={(e) => setFormData({ bloodPressure: e.target.value })}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Contoh: 120/80"
          />
        </div>
      </div>
      {formData.bmi > 0 && (
        <div className="mb-4">
          <label className="block mb-2 text-sm sm:text-base">BMI (Body Mass Index)</label>
          <p className="w-full px-4 py-2 border rounded-md bg-gray-100">{formData.bmi}</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between mt-6">
        <button onClick={() => setStep(1)} className="w-full sm:w-auto bg-gray-300 text-black py-2 px-6 rounded-md mb-2 sm:mb-0">
          Kembali
        </button>
        <button onClick={() => setStep(3)} className="w-full sm:w-auto bg-[#5EB1FF] text-white py-2 px-6 rounded-md">
          Lanjut
        </button>
      </div>
    </div>
  );
};
