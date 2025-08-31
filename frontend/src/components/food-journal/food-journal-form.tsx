"use client";

import React, { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/axios";

// TypeScript declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: unknown;
    webkitSpeechRecognition: unknown;
  }
}

interface FoodJournalFormProps {
  onFoodJournalCreated: () => void;
}

const FoodJournalForm: React.FC<FoodJournalFormProps> = ({ onFoodJournalCreated }) => {
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [description, setDescription] = useState("");
  const [feelingBefore, setFeelingBefore] = useState("normal");
  const [feelingAfter, setFeelingAfter] = useState("satisfied");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Browser Anda tidak mendukung speech recognition");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "id-ID"; // Indonesian language
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
      toast.info("Mulai berbicara... Ceritakan makanan yang Anda makan");
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setDescription((prev) => prev + (prev ? " " : "") + speechResult);
      toast.success("Suara berhasil diconvert ke teks!");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setIsRecording(false);
      console.error("Speech recognition error:", event.error);
      toast.error("Error saat merekam suara");
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!mealName.trim()) {
      toast.error("Nama makanan harus diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/food-journal/create", {
        meal_name: mealName,
        meal_type: mealType,
        description: description,
        feeling_before: feelingBefore,
        feeling_after: feelingAfter,
        transcript_text: description, // For AI analysis
      });

      // Reset form
      setMealName("");
      setMealType("breakfast");
      setDescription("");
      setFeelingBefore("normal");
      setFeelingAfter("satisfied");

      onFoodJournalCreated();
      toast.success("Jurnal makanan berhasil ditambahkan!");
    } catch (error) {
      console.error("Error creating food journal:", error);
      toast.error("Gagal menambahkan jurnal makanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Meal Name */}
      <div>
        <label htmlFor="mealName" className="block text-sm font-medium text-gray-700 mb-1">
          Nama Makanan
        </label>
        <input
          type="text"
          id="mealName"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Contoh: Nasi goreng ayam"
          required
        />
      </div>

      {/* Meal Type */}
      <div>
        <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-1">
          Jenis Makanan
        </label>
        <select
          id="mealType"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="breakfast">Sarapan</option>
          <option value="lunch">Makan Siang</option>
          <option value="dinner">Makan Malam</option>
          <option value="snack">Snack/Camilan</option>
        </select>
      </div>

      {/* Description with Voice Input */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi Makanan
        </label>
        <div className="relative">
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
            rows={3}
            placeholder="Ceritakan makanan yang Anda makan, rasa, porsi, dll..."
          />
          <button
            type="button"
            onClick={handleSpeechRecognition}
            disabled={isRecording}
            className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${
              isRecording ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600 hover:bg-blue-200"
            }`}
            title="Rekam suara">
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        </div>
        {isRecording && (
          <p className="text-sm text-red-600 mt-1 animate-pulse">🎤 Sedang merekam... Tap tombol mic untuk berhenti</p>
        )}
      </div>

      {/* Feelings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="feelingBefore" className="block text-sm font-medium text-gray-700 mb-1">
            Perasaan Sebelum Makan
          </label>
          <select
            id="feelingBefore"
            value={feelingBefore}
            onChange={(e) => setFeelingBefore(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="hungry">Lapar</option>
            <option value="very_hungry">Sangat Lapar</option>
            <option value="normal">Normal</option>
          </select>
        </div>

        <div>
          <label htmlFor="feelingAfter" className="block text-sm font-medium text-gray-700 mb-1">
            Perasaan Setelah Makan
          </label>
          <select
            id="feelingAfter"
            value={feelingAfter}
            onChange={(e) => setFeelingAfter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="full">Kenyang</option>
            <option value="satisfied">Puas</option>
            <option value="still_hungry">Masih Lapar</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {isSubmitting ? "Menyimpan..." : "Simpan Jurnal Makanan"}
      </button>

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Tips:</strong> Gunakan tombol 🎤 untuk input suara yang lebih cepat. AI akan menganalisis makanan Anda dan
          memberikan saran nutrisi!
        </p>
      </div>
    </form>
  );
};

export default FoodJournalForm;
