"use client";

import React from "react";
import { X, Package, Plus } from "lucide-react";
import { ReceiptItem } from "@/types/scanner.types";

interface Props {
  isOpen: boolean;
  items: ReceiptItem[];
  onSelectItem: (item: ReceiptItem, index: number) => void;
  onCancel: () => void;
}

export function ReceiptItemSelectionModal(props: Props) {
  const { isOpen, items, onSelectItem, onCancel } = props;
  
  // Add safety check
  if (!isOpen) return null;
  
  // Ensure items is an array
  const safeItems = Array.isArray(items) ? items : [];
  
  if (safeItems.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tidak Ada Item</h3>
            <p className="text-sm text-gray-500 mb-6">
              Tidak ada item yang berhasil dideteksi dari struk.
            </p>
            <button
              onClick={onCancel}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Pilih Item dari Struk</h3>
              <p className="text-sm text-gray-500 mt-1">
                Ditemukan {safeItems.length} item dalam struk
              </p>
            </div>
            <button 
              onClick={onCancel} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {safeItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-600 mb-2">Semua Item Telah Diproses</h4>
              <p className="text-sm text-gray-500">
                Tidak ada item yang tersisa untuk ditambahkan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {safeItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => onSelectItem(item, index)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
                      <Package size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>Qty: {item.quantity}</span>
                        {item.price && item.price > 0 && <span>• Rp {item.price.toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200">
                    <Plus size={16} className="text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <X size={18} />
              Batal Semua
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Pilih item yang ingin Anda tambahkan ke kulkas. Anda dapat memproses satu per satu.
          </p>
        </div>
      </div>
    </div>
  );
}
