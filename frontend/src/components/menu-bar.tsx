"use client";

import { foodCategories } from "@/types/foodCategory";
import { useSearchStore } from "@/store/useSearchStore";

export function MenuBar() {
  const items = foodCategories;

  const { itemType, setItemType } = useSearchStore();

  return (
    <div className="flex w-full min-w-max h-11 justify-start items-center">
      {items.map((item) => {
        const isSelected = itemType === item;
        return (
          <button
            key={item}
            onClick={() => setItemType(item)}
            className={`self-stretch px-5 bg-transparent inline-flex flex-col justify-between items-center overflow-hidden`}>
            <div className="self-stretch h-0"></div>

            <div
              className={`inline-flex justify-start items-center gap-2.5 
                ${isSelected ? "text-blue-400" : "text-black/90"} 
                text-sm font-normal font-['Poppins'] leading-snug`}>
              {item}
            </div>

            {isSelected ? (
              <div className="self-stretch h-0 outline-2 outline-offset-[-1px] outline-blue-400"></div>
            ) : (
              <div className="self-stretch h-0"></div>
            )}
          </button>
        );
      })}
    </div>
  );
}
