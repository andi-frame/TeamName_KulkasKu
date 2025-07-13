'use client'

import { useState } from "react";

export function MenuBar() {
  const items = ["Semua", "Sayuran", "Daging", "Bumbu"]; // bisa diubah tergantung nanti
  const [selected, setSelected] = useState("Semua");

  return (
    <div className="flex h-11 justify-start items-center">
      {items.map((item) => {
        const isSelected = selected === item;
        return (
          <button
            key={item}
            onClick={() => setSelected(item)}
            className={`self-stretch px-5 bg-transparent inline-flex flex-col justify-between items-center overflow-hidden`}
          >
            <div className="self-stretch h-0"></div>

            <div
              className={`inline-flex justify-start items-center gap-2.5 
                ${isSelected ? "text-blue-400" : "text-black/90"} 
                text-sm font-normal font-['Poppins'] leading-snug`}
            >
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
