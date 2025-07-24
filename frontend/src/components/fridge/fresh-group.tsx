"use client";

import { useEffect, useState } from "react";
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
          setFreshItems(data);
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
          setFreshItems(data);
        } catch (error) {
          console.error("Error fetching fresh items:", error);
        }
      };
      getAllFreshItems();
    }
  }, [searchValue]);

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
