"use client";

import { useState } from "react";
import { Filter, ArrowUpDown, X, Calendar, SortAsc, SortDesc } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";

export default function FilterSortBar() {
  const [showFilters, setShowFilters] = useState(false);
  const [showSorting, setShowSorting] = useState(false);

  const { searchValue, startDate, expDate, sortBy, sortOrder, setSearchValue, setDateFilter, setSorting } = useSearchStore();

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSorting(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field with asc order
      setSorting(field, "asc");
    }
    setShowSorting(false);
  };

  const clearSort = () => {
    setSorting("", "asc");
  };

  const hasActiveFilters = searchValue || startDate || expDate || sortBy;

  return (
    <div className="w-full">
      {/* Filter and Sort Buttons */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showFilters || searchValue || startDate || expDate
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            <Filter size={16} />
            <span className="text-sm font-medium">Filter</span>
          </button>

          <button
            onClick={() => setShowSorting(!showSorting)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showSorting || sortBy
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            <ArrowUpDown size={16} />
            <span className="text-sm font-medium">Urutkan</span>
            {sortBy && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {sortBy === "name" ? "Nama" : sortBy === "amount" ? "Jumlah" : "Kedaluwarsa"}
                {sortOrder === "asc" ? " ↑" : " ↓"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-blue-700 font-medium">Filter aktif:</span>

            {searchValue && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Nama: &quot;{searchValue}&quot;
                <button onClick={() => setSearchValue("")} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X size={12} />
                </button>
              </span>
            )}

            {startDate && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Dari: {new Date(startDate).toLocaleDateString("id-ID")}
                <button onClick={() => setDateFilter("", expDate)} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X size={12} />
                </button>
              </span>
            )}

            {expDate && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Sampai: {new Date(expDate).toLocaleDateString("id-ID")}
                <button onClick={() => setDateFilter(startDate, "")} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X size={12} />
                </button>
              </span>
            )}

            {sortBy && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Urutkan: {sortBy === "name" ? "Nama" : sortBy === "amount" ? "Jumlah" : "Kedaluwarsa"}
                {sortOrder === "asc" ? " ↑" : " ↓"}
                <button onClick={clearSort} className="hover:bg-green-200 rounded-full p-0.5">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="space-y-4 pt-4">
            {/* Search by Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari berdasarkan nama</label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Masukkan nama makanan..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Tanggal masuk dari
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setDateFilter(e.target.value, expDate)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Kedaluwarsa sampai
                </label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setDateFilter(startDate, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sorting Panel */}
      {showSorting && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Urutkan berdasarkan:</h3>

            <button
              onClick={() => handleSortChange("name")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                sortBy === "name"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}>
              <span>Nama Makanan</span>
              {sortBy === "name" && (sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />)}
            </button>

            <button
              onClick={() => handleSortChange("amount")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                sortBy === "amount"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}>
              <span>Jumlah</span>
              {sortBy === "amount" && (sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />)}
            </button>

            <button
              onClick={() => handleSortChange("exp_date")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                sortBy === "exp_date"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}>
              <span>Tanggal Kedaluwarsa</span>
              {sortBy === "exp_date" && (sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />)}
            </button>

            {sortBy && (
              <button
                onClick={clearSort}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                <X size={16} />
                <span>Hapus Pengurutan</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
