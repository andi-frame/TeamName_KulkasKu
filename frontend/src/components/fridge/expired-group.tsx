"use client";

import { useEffect, useState, useCallback } from "react";
import { FoodCard } from "@/components/food-card";
import api from "@/utils/axios";
import { Item } from "@/types/item.types";
import Popup from "../popup";
import FoodCardPopup from "./food-card-popup";
import { useSearchStore } from "@/store/useSearchStore";

export default function ExpiredGroup() {
  const [expanded, setExpanded] = useState(false);
  const [expiredItems, setExpiredItems] = useState<Item[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const searchValue = useSearchStore((state) => state.searchValue);
  const startDate = useSearchStore((state) => state.startDate);
  const expDate = useSearchStore((state) => state.expDate);
  const itemType = useSearchStore((state) => state.itemType);
  const sortBy = useSearchStore((state) => state.sortBy);
  const sortOrder = useSearchStore((state) => state.sortOrder);

  const cardHeight = 80;
  const expandedGap = 10;
  const collapsedGap = 10;

  const sortItems = useCallback((items: Item[]) => {
    if (!sortBy) return items;

    return [...items].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;
      
      switch (sortBy) {
        case "name":
          aValue = a.Name.toLowerCase();
          bValue = b.Name.toLowerCase();
          break;
        case "amount":
          aValue = a.Amount;
          bValue = b.Amount;
          break;
        case "exp_date":
          aValue = new Date(a.ExpDate);
          bValue = new Date(b.ExpDate);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortBy, sortOrder]);

  // API Call
  useEffect(() => {
    if (searchValue || startDate || expDate) {
      const getSearchedExpiredItems = async () => {
        try {
          const response = await api.get("/item/expired/search", {
            params: { 
              name: searchValue,
              start: startDate,
              exp: expDate,
              itemType: itemType
             }
          });
          const data = response.data.data;
          const sortedData = sortItems(data);
          setExpiredItems(sortedData);

          const height = expanded
            ? cardHeight + (sortedData.length - 1) * (cardHeight + expandedGap) + 60
            : cardHeight + (sortedData.length - 1) * collapsedGap + 60;
          setContainerHeight(height);

        } catch (error) {
          console.error("Error fetching expired items:", error);
        }
      };
      getSearchedExpiredItems();  
    } else {
      const getAllExpiredItems = async () => {
        try {
          const response = await api.get("/item/expired", {
            params: {
              itemType: itemType
            }
          });
          const data = response.data.data;
          const sortedData = sortItems(data);
          setExpiredItems(sortedData);
  
          const height = expanded
            ? cardHeight + (sortedData.length - 1) * (cardHeight + expandedGap) + 60
            : cardHeight + (sortedData.length - 1) * collapsedGap + 60;
          setContainerHeight(height);
          
        } catch (error) {
          console.error("Error fetching expired items:", error);
        }
      };
  
      getAllExpiredItems();
    }
  }, [expanded, searchValue, startDate, expDate, itemType, sortBy, sortOrder, sortItems]);

  return (
    <>
      {expiredItems.length > 0 &&(
        <>
        <div className="relative w-full transition-all duration-300" style={{ height: containerHeight }}>
          <div className="relative transition-all duration-300 cursor-pointer mb-4" onClick={() => setExpanded(!expanded)}>
            <p className="font-semibold">
              expired <span className="bg-gray-200 text-black px-2 py-0.5 rounded-full text-xs">{expiredItems.length}</span>
            </p>
          </div>

          <div className="relative">
            {expiredItems.map((item, index) => (
              <div
                key={item.ID}
                className="absolute w-full transition-transform duration-300"
                style={{
                  transform: `translateY(${expanded ? index * (cardHeight + expandedGap) : index * collapsedGap}px)`,
                  zIndex: expiredItems.length - index,
                }}
                onClick={() => setSelectedItem(item)}>
                <FoodCard {...item} />
              </div>
            ))}
          </div>
        </div>
              
          <Popup isOpen={!!selectedItem} onClose={() => setSelectedItem(null)}>
          {selectedItem && <FoodCardPopup {...selectedItem} />}
          </Popup>
        </>
      )}
    </>
  );
}
