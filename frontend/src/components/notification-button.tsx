"use client";

import { Bell, AlertTriangle } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useState, useEffect } from "react";
import api from "@/utils/axios";
import { Item } from "@/types/item.types";

export default function NotificationButton() {
  const { showExpiryNotification, setShowExpiryNotification } = useNotificationStore();
  const [expiringCount, setExpiringCount] = useState(0);

  useEffect(() => {
    const checkExpiringItems = async () => {
      try {
        const response = await api.get("/item/fresh");
        const items = response.data.data || [];
        
        // Filter items yang akan expired dalam 1-2 hari
        const now = new Date();
        const filtered = items.filter((item: Item) => {
          const expDate = new Date(item.ExpDate);
          const diffTime = expDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 2;
        });

        setExpiringCount(filtered.length);
      } catch (error) {
        console.error("Error fetching expiring items:", error);
        setExpiringCount(0);
      }
    };

    checkExpiringItems();
  }, []);

  if (expiringCount === 0) {
    return null;
  }

  return (
    <button
      onClick={() => setShowExpiryNotification(true)}
      className={`fixed bottom-20 right-4 z-40 p-3 rounded-full shadow-lg transition-all duration-300 ${
        showExpiryNotification 
          ? "bg-gray-500 text-white" 
          : "bg-red-500 text-white animate-pulse"
      }`}
      title="Lihat peringatan kadaluwarsa"
    >
      <div className="relative">
        {expiringCount > 0 && !showExpiryNotification ? (
          <AlertTriangle size={24} />
        ) : (
          <Bell size={24} />
        )}
        {expiringCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {expiringCount}
          </span>
        )}
      </div>
    </button>
  );
}
