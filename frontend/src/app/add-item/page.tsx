"use client";

import { toast } from 'sonner'

import React, { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import api from "@/utils/axios";
import { FoodScanner } from "@/components/food-scanner";
import { AIResultModal } from "@/components/ai-result-modal";
import { ReceiptItemSelectionModal } from "@/components/receipt-item-selection";
import { ItemFormModal } from "@/components/item-form-modal";
import { ContinueReceiptModal } from "@/components/continue-receipt-modal";
import { BarcodeResult, ImagePredictionResult, ReceiptResult, ReceiptItem } from "@/types/scanner.types";

interface ItemFormData {
  name: string;
  type: string;
  amount: number;
  amountType: string;
  startDate: string;
  expDate: string;
  desc: string;
}

const Page = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [amountType, setAmountType] = useState("satuan");
  const [startDate, setStartDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [desc, setDesc] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showAIResult, setShowAIResult] = useState(false);
  const [aiResult, setAiResult] = useState<ImagePredictionResult | null>(null);

  const [showReceiptItemSelection, setShowReceiptItemSelection] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showContinueReceipt, setShowContinueReceipt] = useState(false);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [processedItemIndexes, setProcessedItemIndexes] = useState<number[]>([]);
  const [currentItem, setCurrentItem] = useState<ReceiptItem | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split("T")[0]; // "yyyy-mm-dd"
    setStartDate(formatted);
  }, []);

  const handleScanClick = () => {
    setShowScanner(true);
  };

  const handleImageResult = (result: ImagePredictionResult) => {
    // Show AI result modal instead of directly filling form
    setAiResult(result);
    setShowAIResult(true);
    setShowScanner(false);
  };

  const handleBarcodeResult = (result: BarcodeResult) => {
    // Fill form with barcode data directly (no AI analysis needed)
    setName(result.name);
    setShowScanner(false);
  };

  const handleAcceptAIResult = () => {
    if (aiResult) {
      const startDateObj = new Date(startDate);
      startDateObj.setDate(startDateObj.getDate() + aiResult.predicted_remaining_days);
      const calculatedExpDate = startDateObj.toISOString().split("T")[0];

      // Fill form with AI result data
      setName(aiResult.item_name);
      setExpDate(calculatedExpDate);
      if (aiResult.condition_description) {
        setDesc(aiResult.condition_description);
      }
      setShowAIResult(false);
      setAiResult(null);
    }
  };

  const handleCancelAIResult = () => {
    setShowAIResult(false);
    setAiResult(null);
  };

  const handleReceiptResult = (result: ReceiptResult) => {
    if (!result || !Array.isArray(result.items)) {
      console.error("Invalid receipt result structure:", result);
      toast.error("Format data receipt tidak valid");
      return;
    }

    console.log("Processing receipt result:", result);

    setReceiptItems(result.items);
    setProcessedItemIndexes([]);
    setShowReceiptItemSelection(true);
    setShowScanner(false);
  };

  const handleSelectReceiptItem = (item: ReceiptItem, filteredIndex: number) => {
    const availableItems = receiptItems.filter((_, index) => !processedItemIndexes.includes(index));
    const selectedItem = availableItems[filteredIndex];
    const originalIndex = receiptItems.findIndex((originalItem) => originalItem === selectedItem);

    setCurrentItem(item);
    setCurrentItemIndex(originalIndex);
    setShowReceiptItemSelection(false);
    setShowItemForm(true);
  };

  const handleCancelReceiptItemSelection = () => {
    setShowReceiptItemSelection(false);
    setReceiptItems([]);
    setProcessedItemIndexes([]);
  };

  const handleSubmitItemForm = async (formData: ItemFormData) => {
    try {
      const response = await api.post("/item/create", formData);
      console.log("Response:", response.data);

      if (currentItemIndex !== null) {
        setProcessedItemIndexes((prev) => [...prev, currentItemIndex]);
      }

      setShowItemForm(false);
      setCurrentItem(null);
      setCurrentItemIndex(null);

      setShowContinueReceipt(true);
    } catch (err: unknown) {
      console.error("Error:", err);
      toast.error("Gagal menambahkan item.");
    }
  };

  const handleCancelItemForm = () => {
    setShowItemForm(false);
    setCurrentItem(null);
    setCurrentItemIndex(null);
    setShowReceiptItemSelection(true);
  };

  const handleContinueReceipt = () => {
    setShowContinueReceipt(false);
    setShowReceiptItemSelection(true);
  };

  const handleFinishReceipt = () => {
    setShowContinueReceipt(false);
    setReceiptItems([]);
    setProcessedItemIndexes([]);
    setCurrentItem(null);
    setCurrentItemIndex(null);
    toast.success("Semua item dari struk telah diproses!");
  };

  const handleCloseScannerPopup = () => {
    setShowScanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type || !amount || !amountType || !startDate || !expDate) {
      toast.error("Semua field wajib diisi kecuali deskripsi.");
      return;
    }

    try {
      const response = await api.post("/item/create", {
        name,
        type,
        amount: parseFloat(amount),
        amountType,
        desc,
        startDate,
        expDate,
      });

      console.log("Response:", response.data);
      toast.success("Item berhasil ditambahkan!");

      // Clear form after success
      setName("");
      setType("");
      setAmount("");
      setAmountType("satuan");
      setStartDate(new Date().toISOString().split("T")[0]);
      setExpDate("");
      setDesc("");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error:", err.response?.data || err.message);
      toast.error("Gagal menambahkan item.");
    }
  };

  return (
    <div className="w-full p-4 flex flex-col justify-start gap-3">
      <Link href="/fridge" className="flex gap-1 items-center">
        <ChevronLeft size={35} strokeWidth={1} />
        <span className="text-md font-extralight">Tambah Item</span>
      </Link>

      <form onSubmit={handleSubmit} className="flex flex-col justify-center pt-6">
        <div className="text-xl font-bold py-5">Tambahkan Item</div>

        <div className="flex flex-col gap-3">
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
                type="float"
                className="text-xs ring-1 ring-[#CBD5E1] flex-shrink rounded-md p-2 min-w-0 w-1/2 focus:outline-[#5DB1FF]"
                placeholder="Masukkan jumlah"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <select
                className="text-xs ring-1 ring-[#CBD5E1] flex-shrink rounded-md p-2 min-w-0 w-1/2 focus:outline-[#5DB1FF]"
                value={amountType}
                onChange={(e) => setAmountType(e.target.value)}>
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
            />
          </div>

          {/* Tanggal Kedaluwarsa */}
          <div className="flex flex-col">
            <label htmlFor="expDate" className="text-xs font-semibold py-1">
              Tanggal Kedaluwarsa
            </label>
            <div className="w-full flex gap-3">
              <input
                type="date"
                id="expDate"
                className="text-xs ring-1 ring-[#CBD5E1] flex-shrink rounded-md p-2 min-w-0 w-2/3 focus:outline-[#5DB1FF]"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
              />
              <button
                type="button"
                onClick={handleScanClick}
                className="text-xs text-center min-w-0 w-1/3 py-2 bg-[#5DB1FF] rounded-md text-white font-semibold flex-shrink">
                Scan
              </button>
            </div>
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

        {/* Submit */}
        <div className="w-full pt-10">
          <button type="submit" className="text-xs text-center w-full py-2 bg-[#5DB1FF] rounded-md text-white font-semibold">
            Tambah
          </button>
        </div>
      </form>

      {/* Scanner Popup */}
      {showScanner && (
        <FoodScanner
          onImageResult={handleImageResult}
          onBarcodeResult={handleBarcodeResult}
          onReceiptResult={handleReceiptResult}
          onClose={handleCloseScannerPopup}
        />
      )}

      {/* AI Result Modal */}
      <AIResultModal isOpen={showAIResult} result={aiResult} onAccept={handleAcceptAIResult} onCancel={handleCancelAIResult} />

      {/* Receipt Item Selection Modal */}
      <ReceiptItemSelectionModal
        isOpen={showReceiptItemSelection}
        items={receiptItems.filter((_, index) => !processedItemIndexes.includes(index))}
        onSelectItem={handleSelectReceiptItem}
        onCancel={handleCancelReceiptItemSelection}
      />

      {/* Item Form Modal */}
      <ItemFormModal isOpen={showItemForm} item={currentItem} onSubmit={handleSubmitItemForm} onCancel={handleCancelItemForm} />

      {/* Continue Receipt Modal */}
      <ContinueReceiptModal
        isOpen={showContinueReceipt}
        remainingItemsCount={receiptItems.length - processedItemIndexes.length}
        onContinue={handleContinueReceipt}
        onFinish={handleFinishReceipt}
      />
    </div>
  );
};

export default Page;
