import { Navbar } from "@/components/navbar";
import { SidebarDesktop } from "@/components/sidebar";
import { ReactNode } from "react";

export default function MainPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      {/* Sidebar (desktop only) */}
      <SidebarDesktop />

      {/* Main content area */}
      <main className="flex-1 md:ml-20"> 
        {children}
      </main>

      {/* Navbar (mobile only) */}
      <div className="md:hidden">
        <Navbar />
      </div>
    </div>
  );
}
