"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/utils/axios";
import { FoodJournal } from "@/types/food-journal.types";
import { handleApiError } from "@/utils/food-journal.utils";

export default function EditFoodJournal() {
  const params = useParams();
  const router = useRouter();
  const journalId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    meal_name: "",
    meal_type: "breakfast",
    description: "",
    feeling_before: "normal",
    feeling_after: "satisfied",
  });

  useEffect(() => {
    if (journalId) {
      fetchJournalDetail();
    }
  }, [journalId]);

  const fetchJournalDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/food-journal/${journalId}`);
      const journal: FoodJournal = response.data.data;

      setFormData({
        meal_name: journal.meal_name || "",
        meal_type: journal.meal_type || "breakfast",
        description: journal.description || "",
        feeling_before: journal.feeling_before || "normal",
        feeling_after: journal.feeling_after || "satisfied",
      });
    } catch (error) {
      handleApiError(error, "Gagal memuat detail jurnal makanan");
      router.push("/add-food");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.meal_name.trim()) {
      toast.error("Nama makanan harus diisi");
      return;
    }

    try {
      setSaving(true);

      await api.put("/food-journal/update", {
        id: journalId,
        meal_name: formData.meal_name,
        meal_type: formData.meal_type,
        description: formData.description,
        feeling_before: formData.feeling_before,
        feeling_after: formData.feeling_after,
      });

      toast.success("Jurnal makanan berhasil diperbarui");
      router.push(`/add-food/${journalId}`);
    } catch (error) {
      handleApiError(error, "Gagal memperbarui jurnal makanan");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data jurnal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/add-food/${journalId}`} className="flex gap-1 items-center">
              <ChevronLeft size={24} strokeWidth={1.5} />
              <span className="text-lg font-medium">Edit Jurnal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meal Name */}
          <div className="bg-white rounded-lg shadow p-6">
            <label htmlFor="meal_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Makanan *
            </label>
            <input
              type="text"
              id="meal_name"
              name="meal_name"
              value={formData.meal_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Contoh: Nasi Gudeg Komplit"
              required
            />
          </div>

          {/* Meal Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <label htmlFor="meal_type" className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Makanan
            </label>
            <select
              id="meal_type"
              name="meal_type"
              value={formData.meal_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="breakfast">Sarapan</option>
              <option value="lunch">Makan Siang</option>
              <option value="dinner">Makan Malam</option>
              <option value="snack">Snack/Camilan</option>
            </select>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ceritakan tentang makanan yang Anda makan..."
            />
          </div>

          {/* Feelings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Perasaan</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="feeling_before" className="block text-sm font-medium text-gray-700 mb-2">
                  Sebelum Makan
                </label>
                <select
                  id="feeling_before"
                  name="feeling_before"
                  value={formData.feeling_before}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="hungry">Lapar</option>
                  <option value="very_hungry">Sangat Lapar</option>
                  <option value="normal">Normal</option>
                </select>
              </div>

              <div>
                <label htmlFor="feeling_after" className="block text-sm font-medium text-gray-700 mb-2">
                  Setelah Makan
                </label>
                <select
                  id="feeling_after"
                  name="feeling_after"
                  value={formData.feeling_after}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="full">Kenyang</option>
                  <option value="satisfied">Puas</option>
                  <option value="still_hungry">Masih Lapar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>

        {/* Note */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            <strong>Catatan:</strong> Data nutrisi dan analisis AI tidak dapat diubah. Jika Anda ingin mengubah analisis nutrisi,
            silakan buat jurnal makanan baru.
          </p>
        </div>
      </div>
    </div>
  );
}
