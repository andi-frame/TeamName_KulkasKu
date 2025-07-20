import React from "react";
import { X, Check, XCircle } from "lucide-react";

interface AIResultModalProps {
  isOpen: boolean;
  result: {
    item_name: string;
    predicted_remaining_days: number;
    reasoning: string;
    condition_description?: string;
  } | null;
  onAccept: () => void;
  onCancel: () => void;
}

export function AIResultModal({ isOpen, result, onAccept, onCancel }: AIResultModalProps) {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Hasil Analisis AI</h3>
          <p className="text-sm text-gray-500 mt-1">AI telah berhasil menganalisis produk Anda</p>
        </div>

        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-green-800 text-center font-medium">Analisis berhasil! Data siap untuk digunakan.</p>
        </div>

        {/* Result Details */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nama Produk</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{result.item_name}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Prediksi Daya Tahan</label>
                <p className="text-sm font-medium text-gray-800 mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      result.predicted_remaining_days <= 2
                        ? "bg-red-100 text-red-800"
                        : result.predicted_remaining_days <= 5
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                    {result.predicted_remaining_days} hari lagi
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Tanggal kedaluwarsa akan dihitung otomatis berdasarkan tanggal masuk</p>
              </div>

              {result.condition_description && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Deskripsi Kondisi</label>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">{result.condition_description}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Alasan AI</label>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{result.reasoning}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium">
            <XCircle size={18} />
            Batal
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
            <Check size={18} />
            Gunakan Data Ini
          </button>
        </div>
      </div>
    </div>
  );
}
