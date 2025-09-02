"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Edit, Trash2, Calendar, Clock, Tag, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/utils/axios";
import { FoodJournal } from "@/types/food-journal.types";
import { formatDate, getMealTypeLabel, getFeelingIcon, handleApiError } from "@/utils/food-journal.utils";

export default function FoodJournalDetail() {
  const params = useParams();
  const router = useRouter();
  const journalId = params?.id as string;

  const [journal, setJournal] = useState<FoodJournal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (journalId) {
      fetchJournalDetail();
    }
  }, [journalId]);

  const fetchJournalDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/food-journal/${journalId}`);
      setJournal(response.data.data);
    } catch (error) {
      handleApiError(error, "Gagal memuat detail jurnal makanan");
      router.push("/add-food");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/food-journal/delete/${journalId}`);
      toast.success("Jurnal makanan berhasil dihapus");
      router.push("/add-food");
    } catch (error) {
      handleApiError(error, "Gagal menghapus jurnal makanan");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail jurnal...</p>
        </div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Jurnal makanan tidak ditemukan</p>
          <Link href="/add-food" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg">
            Kembali
          </Link>
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
            <Link href="/add-food" className="flex gap-1 items-center">
              <ChevronLeft size={24} strokeWidth={1.5} />
              <span className="text-lg font-medium">Detail Jurnal</span>
            </Link>
            <div className="flex gap-2">
              <Link
                href={`/add-food/${journalId}/edit`}
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
                <Edit size={20} />
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{journal.meal_name}</h1>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">{formatDate(journal.created_at)}</span>
            </div>

            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">{getMealTypeLabel(journal.meal_type)}</span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Input: {journal.input_type === "text" ? "Teks" : "Gambar"}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {journal.description && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi</h2>
            <p className="text-gray-700 leading-relaxed">{journal.description}</p>
          </div>
        )}

        {/* Feelings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Perasaan</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">{getFeelingIcon(journal.feeling_before)}</div>
              <p className="text-sm text-gray-600">Sebelum Makan</p>
              <p className="font-medium capitalize">{journal.feeling_before.replace("_", " ")}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">{getFeelingIcon(journal.feeling_after)}</div>
              <p className="text-sm text-gray-600">Setelah Makan</p>
              <p className="font-medium capitalize">{journal.feeling_after.replace("_", " ")}</p>
            </div>
          </div>
        </div>

        {/* Nutrition */}
        {journal.ai_nutrition && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Nutrisi</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{Math.round(journal.ai_nutrition.calories)}</div>
                <div className="text-sm text-gray-600">Kalori</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{Math.round(journal.ai_nutrition.protein)}g</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(journal.ai_nutrition.carbs)}g</div>
                <div className="text-sm text-gray-600">Karbohidrat</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(journal.ai_nutrition.fat)}g</div>
                <div className="text-sm text-gray-600">Lemak</div>
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{Math.round(journal.ai_nutrition.sugar)}g</div>
                <div className="text-sm text-gray-600">Gula</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round(journal.ai_nutrition.fiber)}g</div>
                <div className="text-sm text-gray-600">Serat</div>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {journal.ai_recommendations && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Rekomendasi</h2>
            {journal.ai_recommendations.next_meal_suggestion && (
              <div className="mb-3">
                <p className="font-medium text-blue-600">Makanan Selanjutnya:</p>
                <p className="text-gray-700">{journal.ai_recommendations.next_meal_suggestion}</p>
              </div>
            )}
            {journal.ai_recommendations.nutrition_tips && (
              <div className="mb-3">
                <p className="font-medium text-green-600">Tips Nutrisi:</p>
                <p className="text-gray-700">{journal.ai_recommendations.nutrition_tips}</p>
              </div>
            )}
            {journal.ai_recommendations.motivational_message && (
              <div>
                <p className="font-medium text-purple-600">Motivasi:</p>
                <p className="text-gray-700">{journal.ai_recommendations.motivational_message}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="text-center">
              <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Jurnal Makanan</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus jurnal &quot;{journal.meal_name}&quot;? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
                  {deleting ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
