"use client";

import { PcCase, Salad, Settings, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.05)] flex justify-around items-center h-24">
      <Link href={"/fridge"} className="flex flex-col items-center gap-2">
        <PcCase size={24} strokeWidth={1} />
        <span className="text-xs font-normal leading-snug">kulkas</span>
      </Link>
      <Link href={"/recipe"} className="flex flex-col items-center gap-2">
        <Salad size={24} strokeWidth={1} />
        <span className="text-xs font-normal leading-snug">resep.ai</span>
      </Link>
      <div className="relative flex flex-col items-center">
        <div 
          className="absolute -top-16 w-16 h-16 bg-white rounded-full shadow-[0px_0px_8px_0px_rgba(0,0,0,0.10)] flex items-center justify-center cursor-pointer"
          onClick={() => setShowPopup(!showPopup)}
        >
          <Plus className="w-12 h-12" size={50} strokeWidth={1.25} color="#5DB1FF" />
          
          {/* Popup options */}
          {showPopup && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-6">
                <Link 
                  href="/add-item" 
                  className="flex items-center gap-2 bg-white shadow-lg rounded-full p-2"
                >
                  <div className="w-12 h-12 flex items-center justify-center hover:bg-gray-50">
                    <Plus size={32} strokeWidth={1.5} color="#5DB1FF" />
                  </div>
                  <span className="text-[14px] font-normal text-gray-600 whitespace-nowrap pr-2">Add Item</span>
                </Link>

                <Link
                  href="/add-food"
                  className="flex items-center gap-2 bg-white shadow-lg rounded-full p-2"
                >
                  <div className="w-12 h-12 flex items-center justify-center hover:bg-gray-50">
                    <Salad size={32} strokeWidth={1.5} color="#5DB1FF" />
                  </div>
                  <span className="text-[14px] font-normal text-gray-600 whitespace-nowrap pr-2">Add Food</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Link href={"/shopping-cart"} className="flex flex-col items-center gap-2">
        <ShoppingCart size={24} strokeWidth={1} />
        <span className="text-xs font-normal leading-snug">cart</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center gap-2">
        <Settings size={24} strokeWidth={1} />
        <span className="text-xs font-normal leading-snug">profile</span>
      </Link>
    </div>
  );
}
