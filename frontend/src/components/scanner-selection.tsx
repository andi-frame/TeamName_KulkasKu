import React from "react";
import { Barcode, Fullscreen, ReceiptText } from "lucide-react";

interface ScannerSelectionProps {
  onSelect: (type: "barcode" | "image" | "receipt") => void;
}

export function ScannerSelection({ onSelect }: ScannerSelectionProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 w-[400px] h-[150px]">
      <div className="bg-[white] rounded-lg shadow-lg p-2 w-full">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSelect("barcode")}
            className="flex flex-col items-center justify-center bg-[#F5F5F5] border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group">
            <div className="flex flex-col items-center">
              <div className="w-[80px] h-[80px] flex items-center justify-center">
                <Barcode size={70} />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">barcode scan</span>
            </div>
          </button>

          <button
            onClick={() => onSelect("image")}
            className="flex flex-col items-center justify-center bg-[#F5F5F5] border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 group">
            <div className="flex flex-col items-center">
              <div className="w-[80px] h-[80px] flex items-center justify-center">
                <Fullscreen size={65} />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">image scan</span>
            </div>
          </button>

          <button
            onClick={() => onSelect("receipt")}
            className="flex flex-col items-center justify-center bg-[#F5F5F5] border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group">
            <div className="flex flex-col items-center">
              <div className="w-[80px] h-[80px] flex items-center justify-center">
                <ReceiptText size={65} />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">receipt scan</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
