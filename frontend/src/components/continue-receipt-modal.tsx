"use client";

import React from "react";
import { CheckCircle, X, Plus } from "lucide-react";

interface Props {
  isOpen: boolean;
  remainingItemsCount: number;
  onContinue: () => void;
  onFinish: () => void;
}

export function ContinueReceiptModal(props: Props) {
  const { isOpen, remainingItemsCount, onContinue, onFinish } = props;
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Item Berhasil Disimpan!</h3>
          <p className="text-sm text-gray-500 mt-1">
            {remainingItemsCount > 0 
              ? `Masih ada ${remainingItemsCount} item lainnya dari struk.`
              : "Semua item dari struk telah diproses."
            }
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {remainingItemsCount > 0 && (
            <button
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Tambah Item Lainnya
            </button>
          )}
          
          <button
            onClick={onFinish}
            className="w-full flex items-center justify-center gap-3 p-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <X size={20} />
            Selesai
          </button>
        </div>

        {remainingItemsCount > 0 && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Anda dapat melanjutkan menambahkan item lainnya atau selesai sekarang.
          </p>
        )}
      </div>
    </div>
  );
}
