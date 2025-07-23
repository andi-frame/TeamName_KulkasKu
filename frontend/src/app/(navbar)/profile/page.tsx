"use client"
import { UserCircle, X, Plus } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const [chips, setChips] = useState(["Foodie", "Vegan", "Chef", "Low-carb"]);
  const [showModal, setShowModal] = useState(false);
  const [newChip, setNewChip] = useState("");

  const handleAddChip = () => {
    const trimmedChip = newChip.trim();
    if (trimmedChip && !chips.includes(trimmedChip)) {
      setChips([...chips, trimmedChip]);
    }
    setNewChip("");
    setShowModal(false);
  };

  const handleRemoveChip = (indexToRemove: any) => {
    setChips(chips.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full pt-20 p-4 flex flex-col justify-start gap-3 relative">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-2 pt-6">
        <div className="bg-[#CBD5E1] rounded-full p-3">
          <UserCircle size={64} strokeWidth={1.5} />
        </div>
        <div className="text-lg font-semibold">John Doe</div>
        <div className="text-sm text-gray-500">johndoe@example.com</div>
      </div>

      {/* Chips Section */}
      <div className="pt-6">
        <div className="text-sm font-semibold mb-2">Tags</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {chips.map((chip, index) => (
            <span
              key={index}
              className="flex items-center gap-1 text-xs px-3 py-1 bg-[#E2E8F0] text-gray-800 rounded-full font-medium"
            >
              {chip}
              <button
                onClick={() => handleRemoveChip(index)}
                className="hover:text-red-500"
              >
                <X size={12} strokeWidth={2} />
              </button>
            </span>
          ))}

          {/* + Add New Keyword Chip */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 text-xs px-3 py-1 bg-[#E2E8F0] text-gray-600 rounded-full hover:bg-[#cbd5e1] font-medium"
          >
            <Plus size={12} strokeWidth={2} />
            Tambah
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-tranparent bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-md shadow-md p-6 w-80 flex flex-col gap-4">
            <div className="text-sm font-semibold">Tambahkan Kata Kunci</div>
            <input
              type="text"
              className="text-sm ring-1 ring-[#CBD5E1] rounded-md p-2 focus:outline-[#5DB1FF]"
              placeholder="Contoh: Gluten-Free"
              value={newChip}
              onChange={(e) => setNewChip(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="text-sm px-4 py-1 text-gray-500 rounded hover:underline"
              >
                Batal
              </button>
              <button
                onClick={handleAddChip}
                className="text-sm px-4 py-1 bg-[#5DB1FF] text-white rounded-md font-semibold"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
