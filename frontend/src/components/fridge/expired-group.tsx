"use client";

import { useEffect, useState } from "react";
import { FoodCard } from "@/components/food-card";
import api from "@/utils/axios";
import { Item } from "@/types/item.types";
import Popup from "../popup";
import FoodCardPopup from "./food-card-popup";

export default function ExpiredGroup() {
  const [expanded, setExpanded] = useState(false);
  const [expiredItems, setExpiredItems] = useState<Item[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const cardHeight = 80;
  const expandedGap = 10;
  const collapsedGap = 10;

  // API Call
  useEffect(() => {
    const getAllExpiredItems = async () => {
      try {
        const response = await api.get("/item/expired");
        const data = response.data.data;
        setExpiredItems(data);

        const height = expanded
          ? cardHeight + (data.length - 1) * (cardHeight + expandedGap) + 60
          : cardHeight + (data.length - 1) * collapsedGap + 60;
        setContainerHeight(height);
      } catch (error) {
        console.error("Error fetching expired items:", error);
      }
    };

    getAllExpiredItems();
  }, [expanded]);

  return (
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
  );
}
