"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { ReceiptItem } from "@/types/scanner.types";

interface ItemFormData {
  name: string;
  type: string;
  amount: number;
  amountType: string;
  startDate: string;
  expDate: string;
  desc: string;
}

interface Props {
  isOpen: boolean;
  item: ReceiptItem | null;
  onSubmit: (formData: ItemFormData) => void;
  onCancel: () => void;
}

export function ItemFormModal(props: Props) {
  const { isOpen, item, onSubmit, onCancel } = props;
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [amountType, setAmountType] = useState("satuan");
  const [startDate, setStartDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (item && isOpen) {
      setName(item.name);
      setAmount(item.quantity.toString());
      
      const today = new Date();
      const todayString = today.toISOString().split("T")[0];
      setStartDate(todayString);
      
      const expiryDate = new Date(today);
      expiryDate.setDate(today.getDate() + 7);
      setExpDate(expiryDate.toISOString().split("T")[0]);
      
      setType("");
      setAmountType("satuan");
      setDesc("");
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !type || !amount || !amountType || !startDate || !expDate) {
      alert("Semua field wajib diisi kecuali deskripsi.");
      return;
    }

    const formData: ItemFormData = {
      name,
      type,
      amount: parseFloat(amount),
      amountType,
      startDate,
      expDate,
      desc,
    };

    onSubmit(formData);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Tambah Item</h3>
              <p className="text-sm text-gray-500 mt-1">Isi detail untuk: {item.name}</p>
            </div>
            <button 
              onClick={onCancel} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Nama Item */}
            <div className="flex flex-col">
              <label htmlFor="name" className="text-xs font-semibold py-1">
                Nama Item
              </label>
              <input
                type="text"
                id="name"
                className="text-xs ring-1 ring-[#CBD5E1] rounded-md p-2 focus:outline-[#5DB1FF]"
                placeholder="Masukkan nama item"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Tipe Item */}
            <div className="flex flex-col">
              <label htmlFor="type" className="text-xs font-semibold py-1">
                Tipe Item
              </label>
              <input
                list="type-options"
                type="text"
                id="type"
                className="text-xs ring-1 ring-[#CBD5E1] rounded-md p-2 focus:outline-[#5DB1FF]"
                placeholder="Masukkan tipe item"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              />
              <datalist id="type-options">
                <option value="Sayur" />
                <option value="Rempah" />
                <option value="Buah" />
                <option value="Daging" />
                <option value="Minuman" />
                <option value="Lainnya" />
              </datalist>
            </div>

            {/* Jumlah & Satuan */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold py-1">Jumlah</label>
              <div className="flex gap-3 w-full">
                <input
                  type="number"
                  step="0.1"
                  className="text-xs ring-1 ring-[#CBD5E1] flex-shrink rounded-md p-2 min-w-0 w-1/2 focus:outline-[#5DB1FF]"
                  placeholder="Masukkan jumlah"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <select
                  className="text-xs ring-1 ring-[#CBD5E1] flex-shrink rounded-md p-2 min-w-0 w-1/2 focus:outline-[#5DB1FF]"
                  value={amountType}
                  onChange={(e) => setAmountType(e.target.value)}
                >
                  <option value="kilogram">Kilogram</option>
                  <option value="liter">Liter</option>
                  <option value="ikat">Ikat</option>
                  <option value="satuan">Satuan</option>
                </select>
              </div>
            </div>

            {/* Tanggal Masuk */}
            <div className="flex flex-col">
              <label htmlFor="startDate" className="text-xs font-semibold py-1">
                Tanggal Masuk
              </label>
              <input
                type="date"
                id="startDate"
                className="text-xs ring-1 ring-[#CBD5E1] rounded-md p-2 focus:outline-[#5DB1FF]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            {/* Tanggal Kedaluwarsa */}
            <div className="flex flex-col">
              <label htmlFor="expDate" className="text-xs font-semibold py-1">
                Tanggal Kedaluwarsa
              </label>
              <input
                type="date"
                id="expDate"
                className="text-xs ring-1 ring-[#CBD5E1] rounded-md p-2 focus:outline-[#5DB1FF]"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                required
              />
            </div>

            {/* Deskripsi */}
            <div className="flex flex-col">
              <label htmlFor="desc" className="text-xs font-semibold py-1">
                Deskripsi
              </label>
              <input
                type="text"
                id="desc"
                className="text-xs ring-1 ring-[#CBD5E1] rounded-md p-2 focus:outline-[#5DB1FF]"
                placeholder="Masukkan deskripsi makanan"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <X size={18} />
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Check size={18} />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
