"use client";

import React from "react";
import { useSearchStore } from "@/store/useSearchStore";

const FilterPopUp = () => {
  const { startDate, expDate, setDateFilter, clearAllFilters } = useSearchStore();

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value, expDate);
  };

  const handleExpDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(startDate, e.target.value);
  };

  const handleReset = () => {
    clearAllFilters();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-lg font-bold">Filter Tanggal</div>

      {/* Start Date */}
      <div className="flex flex-col">
        <label htmlFor="startDate" className="text-sm font-semibold pb-1">
          Tanggal Masuk
        </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={handleStartDateChange}
          className="text-sm ring-1 ring-gray-300 rounded-md p-2 focus:outline-[#5DB1FF]"
        />
      </div>

      {/* Exp Date */}
      <div className="flex flex-col">
        <label htmlFor="expDate" className="text-sm font-semibold pb-1">
          Tanggal Kedaluwarsa
        </label>
        <input
          type="date"
          id="expDate"
          value={expDate}
          onChange={handleExpDateChange}
          className="text-sm ring-1 ring-gray-300 rounded-md p-2 focus:outline-[#5DB1FF]"
        />
      </div>

      {/* Reset button */}
      <div className="flex justify-end pt-4">
        <button
          className="px-4 py-2 bg-gray-300 text-black rounded-md text-sm font-semibold hover:bg-gray-400"
          onClick={handleReset}
        >
          Reset Filter
        </button>
      </div>
    </div>
  );
};

export default FilterPopUp;