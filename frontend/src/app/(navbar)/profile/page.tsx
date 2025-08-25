"use client";

import { toast } from "sonner";

import { User } from "@/types/user.types";
import api from "@/utils/axios";
import { UserCircle, X, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Tag {
  Tag: string;
}

interface UserPreferences {
  PreferredTags: Tag[];
  AvgCookingTime: number;
  AvgCalories: number;
  ServingPreference: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newChip, setNewChip] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user preferences
        const res = await api.get("/profile");
        console.log(res.data);
        setUser(res.data.profile);
        setPreferences(res.data.preferences);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const handleAddChip = async () => {
    const trimmedChip = newChip.trim();
    if (!trimmedChip || !preferences) return;

    try {
      // Update local state
      setPreferences({ ...preferences });
      setNewChip("");
      setShowModal(false);
    } catch (error) {
      console.error("Failed to add tag:", error);
    }
  };

  const handleRemoveChip = async (indexToRemove: number) => {
    if (!preferences) return;

    try {
      // Update backend
      const newTags = preferences.PreferredTags.filter((_, index) => index !== indexToRemove);

      // Update local state
      setPreferences({ ...preferences, PreferredTags: newTags });
    } catch (error) {
      console.error("Failed to remove tag:", error);
    }
  };

  const handleUpdatePreferencesClick = async () => {
    try {
      const res = await api.post("/admin/recipe/update-preferences");
      if (res.status === 200) {
        toast.success("Successfully updated preferences");
      }
    } catch {
      console.error("Failed to update preferences");
    }
  };

  if (!user) {
    return <div className="w-full pt-20 p-4">Loading profile...</div>;
  }

  return (
    <div className="w-full pt-5 p-4 flex flex-col justify-start gap-3 relative">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-2 pt-6">
        {user.ImageURL ? (
          <Image src={user.ImageURL} width={150} height={150} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="bg-[#CBD5E1] rounded-full p-3">
            <UserCircle size={64} strokeWidth={1.5} />
          </div>
        )}
        <div className="text-lg font-semibold">{user.Name}</div>
        <div className="text-sm text-gray-500">{user.Email}</div>
      </div>

      {user.Email === "andifarhan1094@gmail.com" && (
        <div className="w-full flex justify-center">
          <button className="px-2 py-1 bg-blue-500 text-sm shadow rounded-sm text-white" onClick={handleUpdatePreferencesClick}>
            Update Preference
          </button>
        </div>
      )}

      {/* Avg Cooking Time */}
      {preferences && (
        <div className="pt-6">
          <div className="text-sm mb-2">Average Cooking Time: {preferences.AvgCookingTime}</div>
          <div className="text-sm mb-2">Average Calories: {preferences.AvgCalories}</div>
        </div>
      )}

      {/* Chips Section */}
      {preferences && (
        <div className="pt-6">
          <div className="text-sm font-semibold mb-2">Tags</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {preferences.PreferredTags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 text-xs px-3 py-1 bg-[#E2E8F0] text-gray-800 rounded-full font-medium">
                {tag.Tag}
                <button onClick={() => handleRemoveChip(index)} className="hover:text-red-500">
                  <X size={12} strokeWidth={2} />
                </button>
              </span>
            ))}

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 text-xs px-3 py-1 bg-[#E2E8F0] text-gray-600 rounded-full hover:bg-[#cbd5e1] font-medium">
              <Plus size={12} strokeWidth={2} />
              Tambah
            </button>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
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
              <button onClick={() => setShowModal(false)} className="text-sm px-4 py-1 text-gray-500 rounded hover:underline">
                Batal
              </button>
              <button onClick={handleAddChip} className="text-sm px-4 py-1 bg-[#5DB1FF] text-white rounded-md font-semibold">
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
