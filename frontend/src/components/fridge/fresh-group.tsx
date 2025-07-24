"use client";

import { useEffect, useState, useCallback } from "react";
import { FoodCard } from "@/components/food-card";
import api from "@/utils/axios";
import { Item } from "@/types/item.types";
import Popup from "../popup";
import FoodCardPopup from "./food-card-popup";
import { useSearchStore } from "@/store/useSearchStore";

export default function FreshGroup() {
  const [freshItems, setFreshItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const searchValue = useSearchStore((state) => state.searchValue);
  const startDate = useSearchStore((state) => state.startDate);
  const expDate = useSearchStore((state) => state.expDate);
  const itemType = useSearchStore((state) => state.itemType);
  const sortBy = useSearchStore((state) => state.sortBy);
  const sortOrder = useSearchStore((state) => state.sortOrder);

  // Sort function
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
      const getSearchFreshItem = async () => {
        try {
          const response = await api.get("/item/fresh/search", {
            params: { 
              name: searchValue,
              start: startDate,
              exp: expDate,
              itemType: itemType,
             }
          });
          const data = response.data.data;
          setFreshItems(sortItems(data));
          console.log(data);
        } catch (error) {
          console.error("Error fetching fresh items:", error);
        }
      };
      getSearchFreshItem();
    } else {
      const getAllFreshItems = async () => {
        try {
          const response = await api.get("/item/fresh", {
            params: {
              itemType: itemType
            }
          });
          const data = response.data.data;
          setFreshItems(sortItems(data));
        } catch (error) {
          console.error("Error fetching fresh items:", error);
        }
      };
      getAllFreshItems();
    }
  }, [searchValue, startDate, expDate, itemType, sortBy, sortOrder, sortItems]);

  return (
    <>
      <div className="w-full transition-all duration-300">
        <div className="mb-4">
          <p className="font-semibold">
            storage <span className="bg-gray-200 text-black px-2 py-0.5 rounded-full text-xs">{freshItems.length}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {freshItems.map((item) => (
            <div key={item.ID} className="w-full transition-transform duration-300" onClick={() => setSelectedItem(item)}>
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
