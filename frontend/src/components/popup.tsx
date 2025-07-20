import React from "react";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Popup = ({ isOpen, onClose, children }: PopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50" onClick={onClose}>
      <div className="relative bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md z-60" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-600 hover:text-black" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Popup;
