import Image from "next/image";
import React from "react";
import LoginButton from "@/components/auth/LoginButton";

const page = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
      <Image src="/kulkasku-logo-1.png" alt="logo kulkasku" width={400} height={400} className="w-40" />
      <div className="text-[#5EB1FF] font-bold text-3xl">KulkasKu</div> 
      <div className="absolute bottom-8 w-full flex items-center justify-center">
        <LoginButton />
      </div>
    </div>
  );
};

export default page;
