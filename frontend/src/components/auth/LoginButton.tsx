"use client";

import Image from "next/image";

const LoginButton = () => {
  const handleLogin = () => {
    window.location.href = "https://os80w4wwsggwosc4o88k0csc.kirisame.jp.net/auth/login";
  };

  return (
    <button
      className="cursor-pointer py-1 rounded-xl ring-1 my-5 flex items-center justify-center gap-2 px-8 font-bold whitespace-nowrap"
      onClick={handleLogin}>
      <Image src="/auth/logo-google.svg" alt="Google Logo" height={20} width={20} />
      Masuk dengan Google
    </button>
  );
};

export default LoginButton;
