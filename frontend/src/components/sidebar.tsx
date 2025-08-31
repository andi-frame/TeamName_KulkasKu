"use client";

import { PcCase, Salad, Settings, Plus, ShoppingCart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/utils/utils";

export function SidebarDesktop() {
  const pathname = usePathname();
  const [showAddPopup, setShowAddPopup] = useState(false);

  const items = [
    { href: "/fridge", label: "kulkas", Icon: PcCase },
    { href: "/recipe", label: "resep.ai", Icon: Salad },
    { href: "/shopping-cart", label: "cart", Icon: ShoppingCart },
    { href: "/chatroom", label: "chatbot", Icon: MessageSquare },
    { href: "/profile", label: "profile", Icon: Settings },
  ];

  return (
    <aside
      className="
        hidden md:flex
        fixed left-0 top-0 h-screen w-20
        flex-col items-center justify-between
        bg-white border-r border-slate-200
        shadow-[4px_0_12px_0_rgba(0,0,0,0.04)]
        py-6
      "
      aria-label="Primary">
      <div className="flex flex-col items-center gap-2">
        <Link href="/dashboard" aria-label="Home">
          <div className="h-12 w-12 rounded-md border border-slate-200 flex items-center justify-center text-sm font-semibold">
            <img src="/kulkasku-logo-1.png" alt="Logo" />
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-6">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex flex-col items-center gap-2 px-2 py-2 rounded-md transition",
                active ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
              )}
              aria-current={active ? "page" : undefined}>
              <Icon size={24} strokeWidth={1.25} className={cn("transition", active ? "scale-110" : "group-hover:scale-110")} />
              <span className="text-[11px] leading-none">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Add */}
      <div className="relative">
        <button
          onClick={() => setShowAddPopup(!showAddPopup)}
          className="
            group relative inline-flex items-center justify-center
            h-12 w-12 rounded-full bg-white
            border border-slate-200
            shadow-[0_2px_10px_rgba(0,0,0,0.08)]
            transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]
          "
          aria-label="Add item">
          <Plus className="h-7 w-7" strokeWidth={1.25} color="#5DB1FF" />
        </button>

        {/* Popup */}
        {showAddPopup && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setShowAddPopup(false)} />

            {/* Popup content */}
            <div className="absolute bottom-0 left-16 z-20 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-2">
              <Link
                href="/add-item"
                className="flex items-center text-sm text-slate-700 hover:bg-slate-50 transition"
                onClick={() => setShowAddPopup(false)}>
                <div className="w-12 h-12 flex items-center justify-center hover:bg-gray-50">
                  <Plus size={24} strokeWidth={1.5} color="#5DB1FF" />
                </div>
                <span className="text-[14px] font-normal text-gray-600 whitespace-nowrap pr-2">Add Item</span>
              </Link>
              <Link
                href="/add-food"
                className="flex items-center text-sm text-slate-700 hover:bg-slate-50 transition"
                onClick={() => setShowAddPopup(false)}>
                <div className="w-12 h-12 flex items-center justify-center hover:bg-gray-50">
                  <Salad size={24} strokeWidth={1.5} color="#5DB1FF" />
                </div>
                <span className="text-[14px] font-normal text-gray-600 whitespace-nowrap pr-2">Add Food</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
