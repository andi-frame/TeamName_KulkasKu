"use client";

import { MenuBar } from "./menu-bar";
import { Search, ArrowDownWideNarrow, X } from "lucide-react";
import { useState } from "react";
import { useSearchStore } from "@/store/useSearchStore";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const setSearchValue = useSearchStore((state) => state.setSearchValue);

  const handleSearch = async () => {
    setSearchValue(search);
  };

  return (
    <div className="relative">
      {isSearchOpen && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-transparent p-4 flex items-center gap-2">
          {/* Close button on the left */}
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearch("");
            }}
            className="text-gray-600 hover:text-black"
          >
            <X size={24} />
          </button>

          {/* Input */}
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow p-2 border bg-white border-gray-300 rounded-full focus:outline-none focus:ring"
          />

          {/* Search button on the right */}
          <button
            onClick={handleSearch}
            className="text-gray-600 hover:text-black"
          >
            <Search size={24} />
          </button>
        </div>
      )}

      {/* Header content */}
      <div className="flex flex-col p-6 pb-0 gap-6 shadow-md">
        <div className="w-full inline-flex flex-col justify-start items-start gap-6">
          <div className="relative" onClick={() => setIsSearchOpen(true)}>
            {!isSearchOpen && <Search size={24} strokeWidth={2} className="cursor-pointer" />}
            {isSearchOpen && <div className="h-[24px]"/>}
          </div>
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-start text-2xl font-semibold leading-snug">KulkasKu</div>
            <div className="w-7 h-7 relative overflow-hidden">
              <ArrowDownWideNarrow size={28} strokeWidth={1} />
            </div>
          </div>
          <div className="w-full overflow-x-scroll scroll-smooth">
            <MenuBar />
          </div>
        </div>
      </div>
    </div>
  );
}
