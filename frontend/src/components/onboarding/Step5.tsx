"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import Image from 'next/image';

const fridgeModels = [
  {
    name: "Kulkas Mini",
    capacity: 50,
    icon: "/icons/mini-fridge.svg",
  },
  {
    name: "Kulkas 1 Pintu",
    capacity: 150,
    icon: "/icons/single-door-fridge.svg",
  },
  {
    name: "Kulkas 2 Pintu",
    capacity: 300,
    icon: "/icons/double-door-fridge.svg",
  },
];

export const Step5 = () => {
  const { formData, setFormData, setStep } = useOnboardingStore();
  const router = useRouter();

  const handleSelectModel = (model: {
    name: string;
    capacity: number;
    icon: string;
  }) => {
    setFormData({ fridgeModel: model.name, fridgeCapacity: model.capacity });
  };

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
      <p className="mb-4 text-sm sm:text-base">Pilih model kulkas yang paling sesuai dengan milik Anda.</p>
      <div className="grid grid-cols-3 gap-4">
        {fridgeModels.map((model) => (
          <div
            key={model.name}
            className={`p-4 border rounded-md text-center cursor-pointer ${formData.fridgeModel === model.name ? 'border-blue-500 bg-blue-50' : ''}`}
            onClick={() => handleSelectModel(model)}
          >
            <Image src={model.icon} alt={model.name} width={64} height={64} className="mx-auto mb-2" />
            <p className="text-sm font-medium">{model.name}</p>
          </div>
        ))}
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
