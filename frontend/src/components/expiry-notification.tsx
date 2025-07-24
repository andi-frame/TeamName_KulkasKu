"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, X, Bell, ChevronDown, ChevronUp } from "lucide-react";
import api from "@/utils/axios";
import { Item } from "@/types/item.types";

interface ToastNotificationProps {
  onClose: () => void;
  items: Item[];
}

function ToastNotification({ onClose, items }: ToastNotificationProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Progress bar countdown
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          setIsClosing(true);
          setTimeout(() => {
            onClose();
          }, 300);
          return 0;
        }
        return prev - 1; 
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getDaysUntilExpiry = (expDate: string) => {
    const now = new Date();
    const exp = new Date(expDate);
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyLevel = (days: number) => {
    if (days <= 0) return "critical";
    if (days === 1) return "urgent";
    if (days === 2) return "warning";
    return "info";
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "critical": return "border-red-600 bg-red-50 text-red-900";
      case "urgent": return "border-red-400 bg-red-50 text-red-800";
      case "warning": return "border-yellow-400 bg-yellow-50 text-yellow-800";
      default: return "border-blue-400 bg-blue-50 text-blue-800";
    }
  };

  const getUrgencyIcon = (level: string) => {
    if (level === "critical" || level === "urgent") {
      return <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />;
    }
    return <Clock size={14} className="text-yellow-600 flex-shrink-0" />;
  };

  // Group items by urgency
  const criticalItems = items.filter(item => getDaysUntilExpiry(item.ExpDate) <= 0);
  const urgentItems = items.filter(item => getDaysUntilExpiry(item.ExpDate) === 1);
  const warningItems = items.filter(item => getDaysUntilExpiry(item.ExpDate) === 2);
  const infoItems = items.filter(item => getDaysUntilExpiry(item.ExpDate) > 2);

  const sortedItems = [...criticalItems, ...urgentItems, ...warningItems, ...infoItems];
  const firstItem = sortedItems[0];
  const remainingCount = items.length - 1;

  if (!firstItem) return null;

  const firstItemDays = getDaysUntilExpiry(firstItem.ExpDate);
  const firstItemLevel = getUrgencyLevel(firstItemDays);

  return (
    <div className={`
      toast-container fixed z-50 transition-all duration-300
      bottom-4 right-4 lg:top-4 lg:bottom-auto lg:right-4 
      w-80 lg:w-80 max-w-[calc(100vw-32px)]
      ${isClosing ? 'animate-slide-out-bottom lg:animate-slide-out' : 'animate-slide-in-bottom lg:animate-slide-in'}
    `}>
      <div className="bg-white rounded-lg border shadow-lg overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Compact Header */}
        <div 
          className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-orange-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {getUrgencyIcon(firstItemLevel)}
                <span className="font-medium text-sm text-gray-900 truncate">
                  {firstItem.Name}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-600">
                  {firstItemDays <= 0 ? "Sudah expired!" : 
                   firstItemDays === 1 ? "Besok expired" : 
                   `${firstItemDays} hari lagi`}
                </span>
                {remainingCount > 0 && (
                  <span className="text-xs text-blue-600 font-medium">
                    +{remainingCount} lainnya
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {remainingCount > 0 && (
                <button className="p-1 hover:bg-gray-100 rounded">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && remainingCount > 0 && (
          <div className="border-t bg-gray-50 max-h-48 overflow-y-auto">
            <div className="p-2 space-y-1">
              {sortedItems.slice(1).map((item) => {
                const daysLeft = getDaysUntilExpiry(item.ExpDate);
                const level = getUrgencyLevel(daysLeft);
                return (
                  <div
                    key={item.ID}
                    className={`p-2 rounded border-l-3 text-xs ${getUrgencyColor(level)}`}
                  >
                    <div className="flex items-center gap-2">
                      {getUrgencyIcon(level)}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">
                          {item.Name}
                        </span>
                        <span className="text-opacity-80">
                          {item.Amount} {item.AmountType}
                        </span>
                      </div>
                      <span className="font-medium whitespace-nowrap">
                        {daysLeft <= 0 ? "Expired!" : 
                         daysLeft === 1 ? "Besok" : 
                         `${daysLeft}h`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExpiryNotification() {
  const [expiringItems, setExpiringItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkExpiringItems = async () => {
      try {
        const response = await api.get("/item/fresh");
        const items = response.data.data || [];
        
        const now = new Date();
        const filtered = items.filter((item: Item) => {
          const expDate = new Date(item.ExpDate);
          const diffTime = expDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 2;
        });

        setExpiringItems(filtered);
        
        if (filtered.length > 0) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Error fetching expiring items:", error);
        setExpiringItems([]);
      } finally {
        setLoading(false);
      }
    };

    checkExpiringItems();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || loading || expiringItems.length === 0) {
    return null;
  }

  return <ToastNotification onClose={handleClose} items={expiringItems} />;
}
