"use client";

import { Header } from "@/components/header";
import { Navbar } from "@/components/navbar";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingOverlay } from "@/components/loading-overlay";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.status === 200) {
          if (res.data.has_onboarded === true) {
            router.push("/fridge");
          } else {
            router.push("/onboarding");
          }
        } else {
          router.push("/auth");
        }
      } catch (error: unknown) {
        console.error("Auth check failed:", error);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };
    checkAuthUser();
  }, [router]);

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="bg-white">
      <Header></Header>
      <Navbar></Navbar>
    </div>
  );
}
