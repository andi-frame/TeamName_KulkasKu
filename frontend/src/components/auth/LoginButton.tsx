"use client";

import Image from "next/image";

const LoginButton = () => {
  const handleLogin = () => {
    // TODO: change in prod
    window.location.href = "http://localhost:5000/auth/login";
  };

  return (
    <button
      className="bg-[#5EB1FF] text-white cursor-pointer py-2 rounded-md ring-1 my-5 flex items-center justify-center gap-2 px-8 font-bold whitespace-nowrap"
      onClick={handleLogin}>
      <Image src="/auth/logo-google.svg" alt="Google Logo" height={20} width={20} />
      Masuk dengan Google
    </button>
  );
};

export default LoginButton;
