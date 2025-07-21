import { Header } from "@/components/header";
import { ReactNode } from "react";

export default function FridgePageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="p-4">{children}</main>
    </>
  );
}
