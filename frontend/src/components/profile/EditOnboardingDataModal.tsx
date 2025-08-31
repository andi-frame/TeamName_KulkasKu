"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import api from "@/utils/axios";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EditOnboardingDataModal = ({ isOpen, onClose }: Props) => {
  const { formData, setFormData } = useOnboardingStore();

  const handleSave = async () => {
    try {
      await api.put("/profile/onboarding", formData);
      onClose();
    } catch (error) {
      console.error("Failed to update onboarding data:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Data Onboarding</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm sm:text-base">Biaya Makanan Harian (dalam Rupiah)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rp</span>
              <input
                type="number"
                value={formData.dailyFoodCost || ""}
                onChange={(e) => setFormData({ dailyFoodCost: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
                placeholder="Contoh: 50000"
              />
            </div>
          </div>
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
          <div>
            <label className="block mb-2 text-sm sm:text-base">Aktivitas Harian</label>
            <select
              value={formData.dailyActivity}
              onChange={(e) => setFormData({ dailyActivity: e.target.value })}
              className="w-full px-4 py-2 border rounded-md">
              <option value="">Pilih aktivitas</option>
              <option value="sedentary">Sedentary (jarang olahraga)</option>
              <option value="lightly_active">Lightly Active (olahraga 1-3 hari/minggu)</option>
              <option value="moderately_active">Moderately Active (olahraga 3-5 hari/minggu)</option>
              <option value="very_active">Very Active (olahraga 6-7 hari/minggu)</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm sm:text-base">Target Kesehatan</label>
            <select
              value={formData.healthTarget}
              onChange={(e) => setFormData({ healthTarget: e.target.value })}
              className="w-full px-4 py-2 border rounded-md">
              <option value="">Pilih target</option>
              <option value="weight_loss">Menurunkan berat badan</option>
              <option value="weight_gain">Menaikkan berat badan</option>
              <option value="maintain_weight">Menjaga berat badan</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm sm:text-base">Model Kulkas</label>
            <select
              value={formData.fridgeModel}
              onChange={(e) => {
                const model = e.target.value;
                const capacity = model === "Kulkas Mini" ? 50 : model === "Kulkas 1 Pintu" ? 150 : 300;
                setFormData({ fridgeModel: model, fridgeCapacity: capacity });
              }}
              className="w-full px-4 py-2 border rounded-md">
              <option value="Kulkas Mini">Kulkas Mini</option>
              <option value="Kulkas 1 Pintu">Kulkas 1 Pintu</option>
              <option value="Kulkas 2 Pintu">Kulkas 2 Pintu</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
