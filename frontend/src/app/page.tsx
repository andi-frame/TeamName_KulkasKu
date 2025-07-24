"use client";

import { Header } from "@/components/header";
import { Navbar } from "@/components/navbar";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// import { FoodScanner } from "@/components/food-scanner";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const checkAuthUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.status === 200) {
          router.push("/fridge");
        } else {
          router.push("/auth");
        }
      } catch (error: unknown) {
        console.error("Auth check failed:", error);
        router.push("/auth");
      }
    };
    checkAuthUser();
  }, [router]);

  return (
    <div className="bg-white">
      <Header></Header>
      <Navbar></Navbar>
      {/* <MenuBar/> */}
      {/* <BahanCard
        NamaBahan="Bayam"
        jumlah="2 ikat"
        tanggalAwal={new Date(Date.now())}
        tanggalKedaluwarsa={new Date(Date.now())}
      /> */}
      {/* <FoodScanner 
        onBarcodeResult={(result) => console.log("Barcode result:", result)}
        onImageResult={(result) => console.log("Image result:", result)}
        onReceiptResult={(result) => console.log("Receipt result:", result)}
      /> */}
    </div>
  );
}
