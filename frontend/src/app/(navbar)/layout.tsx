import { Navbar } from "@/components/navbar";
import { ReactNode } from "react";

export default function MainPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Navbar />
    </>
  );
}
