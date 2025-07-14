'use client';

import { useState } from "react";
import { FoodCard } from "@/components/food-card";

const data = [
  { foodName: "Bayam", amount: "2 ikat", createdAt: new Date(Date.now()), expiredAt: new Date(Date.now()) },
  { foodName: "Wortel", amount: "1 kg",  createdAt: new Date(Date.now()), expiredAt: new Date(Date.now()) },
  { foodName: "Tomat", amount: "0.5 kg", createdAt: new Date(Date.now()), expiredAt: new Date(Date.now()) },
];

export function ExpiredGroup() {
  const [expanded, setExpanded] = useState(false);

  const cardHeight = 80; 
  const expandedGap = 10; 
  const collapsedGap = 10;

  const containerHeight = expanded
    ? cardHeight + (data.length - 1) * (cardHeight + expandedGap) + 60
    : cardHeight + (data.length - 1) * collapsedGap + 60;

  return (
    <div className="relative w-full transition-all duration-300"
    style={{ height: containerHeight }}>
      <div
        className="relative transition-all duration-300 cursor-pointer mb-4"
        onClick={() => setExpanded(!expanded)}
      >
        <p className="font-semibold">expired <span className="bg-gray-200 text-black px-2 py-0.5 rounded-full text-xs">{data.length}</span></p>
      </div>

      <div className="relative">
        {data.map((item, index) => (
          <div
            key={index}
            className="absolute w-full transition-transform duration-300"
            
            style={{
              transform: `translateY(${
              expanded ? index * (cardHeight + expandedGap) : index * collapsedGap
            }px)`,
              zIndex: data.length - index,
            }}
          >
            <FoodCard {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}
