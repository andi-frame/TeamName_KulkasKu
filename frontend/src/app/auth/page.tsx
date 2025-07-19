import Image from "next/image";
import React from "react";
import LoginButton from "@/components/auth/LoginButton";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Image src="auth/logo_kulkasku.svg" alt="logo kulkasku" width={200} height={200} className="w-20" />
      <div className="w-40 flex items-center justify-center">
        <LoginButton />
      </div>
    </div>
  );
};

export default page;
