"use client";

import Image from "next/image";

const LoginButton = () => {
  const handleLogin = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    window.location.href = `${baseUrl}/auth/google/login`;
  };

  return (
    <button
      className="bg-white border border-gray-300 text-gray-700 cursor-pointer py-2 rounded-md ring-1 ring-gray-200 my-5 flex items-center justify-center gap-2 px-8 font-bold whitespace-nowrap w-full hover:bg-gray-50"
      onClick={handleLogin}>
      <Image src="/auth/logo-google.svg" alt="Google Logo" height={20} width={20} />
      Masuk dengan Google
    </button>
  );
};

export default LoginButton;
