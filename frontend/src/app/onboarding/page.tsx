"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import { Step1 } from "@/components/onboarding/Step1";
import { Step2 } from "@/components/onboarding/Step2";
import { Step3 } from "@/components/onboarding/Step3";
import { Step4 } from "@/components/onboarding/Step4";
import { Step5 } from "@/components/onboarding/Step5";

const OnboardingPage = () => {
  const { step } = useOnboardingStore();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      case 5:
        return <Step5 />;
      default:
        return <Step1 />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Selamat Datang di KulkasKu!</h1>
          <p className="mt-2 text-gray-600">Bantu kami mengenal Anda lebih baik.</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-[#5EB1FF] h-2.5 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
        <div>{renderStep()}</div>
      </div>
    </div>
  );
};

export default OnboardingPage;
