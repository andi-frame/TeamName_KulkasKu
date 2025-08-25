import Image from "next/image";
import React from "react";
import LoginButton from "@/components/auth/LoginButton";
import AuthForm from "@/components/auth/AuthForm";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Image src="/kulkasku-logo-1.png" alt="logo kulkasku" width={120} height={120} className="mx-auto" />
          <h1 className="text-[#5EB1FF] font-bold text-3xl sm:text-4xl mt-4">KulkasKu</h1>
          <p className="mt-2 text-gray-600">Your Smart Fridge Manager</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
          <AuthForm />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <LoginButton />
        </div>
      </div>
    </div>
  );
};

export default page;
