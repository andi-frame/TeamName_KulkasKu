"use client";

import React, { useState, useRef } from "react";
import { Mic, MicOff, Camera, Type, Upload, X, Brain, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/axios";

// TypeScript declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: unknown;
    webkitSpeechRecognition: unknown;
  }
}

interface FoodAnalysisResult {
  detected_foods: Array<{
    name: string;
    portion: string;
    weight: number;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      sugar: number;
      fiber: number;
      sodium: number;
    };
    description: string;
  }>;
  total_nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    fiber: number;
    sodium: number;
  };
  analysis_text: string;
  confidence: number;
}

interface FoodJournalFormProps {
  onFoodJournalCreated: () => void;
}

const FoodJournalForm: React.FC<FoodJournalFormProps> = ({ onFoodJournalCreated }) => {
  const [currentStep, setCurrentStep] = useState<"input" | "analysis" | "confirmation">("input");

  const [mealType, setMealType] = useState("breakfast");
  const [description, setDescription] = useState("");
  const [feelingBefore, setFeelingBefore] = useState("normal");
  const [feelingAfter, setFeelingAfter] = useState("satisfied");

  const [inputType, setInputType] = useState<"text" | "image">("text");
  const [isRecording, setIsRecording] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editableMealName, setEditableMealName] = useState("");
  const [editableDescription, setEditableDescription] = useState("");

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran gambar terlalu besar. Maksimal 5MB.");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setInputType("image");
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setInputType("text");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Browser Anda tidak mendukung speech recognition");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "id-ID";
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

  const handleAnalyzeFood = async () => {
    if (!description.trim() && !selectedImage) {
      toast.error("Mohon isi deskripsi makanan atau upload gambar");
      return;
    }

    setIsAnalyzing(true);
    try {
      let analysisData: FoodAnalysisResult;

      if (inputType === "image" && selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);
        formData.append("description", description);

        const response = await api.post("/food-journal/analyze-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        analysisData = response.data;
      } else {
        const response = await api.post("/food-journal/analyze-text", {
          description: description,
        });
        analysisData = response.data;
      }

      setAnalysisResult(analysisData);

      if (analysisData.detected_foods.length > 0) {
        const allFoodNames = analysisData.detected_foods.map((food) => food.name).join(", ");
        setEditableMealName(allFoodNames);
      }
      setEditableDescription(analysisData.analysis_text);

      setCurrentStep("analysis");
      toast.success("Analisis AI selesai! Silakan periksa hasilnya.");
    } catch (error) {
      console.error("Error analyzing food:", error);
      toast.error("Gagal menganalisis makanan. Silakan coba lagi.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAnalysis = () => {
    if (!editableMealName.trim()) {
      toast.error("Nama makanan harus diisi");
      return;
    }
    setCurrentStep("confirmation");
  };

  const resetForm = () => {
    setCurrentStep("input");
    setDescription("");
    setEditableMealName("");
    setEditableDescription("");
    setAnalysisResult(null);
    handleRemoveImage();
    setMealType("breakfast");
    setFeelingBefore("normal");
    setFeelingAfter("satisfied");
  };

  const handleFinalSubmit = async () => {
    if (!analysisResult) return;

    setIsSubmitting(true);
    try {
      await api.post("/food-journal/create", {
        meal_name: editableMealName,
        meal_type: mealType,
        description: editableDescription,
        feeling_before: feelingBefore,
        feeling_after: feelingAfter,
        input_type: inputType,
        raw_input: description,
        processed_input: editableDescription,
        food_analysis: JSON.stringify(analysisResult),
      });

      resetForm();
      onFoodJournalCreated();
      toast.success("Jurnal makanan berhasil ditambahkan!");
    } catch (error) {
      console.error("Error creating food journal:", error);
      toast.error("Gagal menambahkan jurnal makanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputStep = () => (
    <div className="space-y-4">
      {/* Input Type Selector */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => {
            setInputType("text");
            handleRemoveImage();
          }}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            inputType === "text" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}>
          <Type className="h-4 w-4" />
          Text & Voice
        </button>
        <button
          type="button"
          onClick={() => setInputType("image")}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            inputType === "image" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}>
          <Camera className="h-4 w-4" />
          Image
        </button>
      </div>

      {/* Image Upload */}
      {inputType === "image" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Gambar Makanan</label>
          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Klik untuk upload gambar makanan</p>
              <p className="text-sm text-gray-500">JPG, PNG hingga 5MB</p>
            </div>
          ) : (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview makanan" className="w-full h-48 object-cover rounded-lg" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        </div>
      )}

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          {inputType === "image" ? "Deskripsi Tambahan (Opsional)" : "Ceritakan makanan Anda dengan lengkap"}
        </label>
        <div className="relative">
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
            rows={4}
            placeholder={
              inputType === "image"
                ? "Tambahkan keterangan jika diperlukan..."
                : "Contoh: 'Saya makan nasi gudeg komplit dengan ayam, telur, tahu, tempe, dan sambal krecek. Porsinya satu piring besar sekitar 400 gram. Minumnya es teh manis satu gelas.'"
            }
            required={inputType === "text"}
          />
          {inputType === "text" && (
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
          )}
        </div>
        {isRecording && (
          <p className="text-sm text-red-600 mt-1 animate-pulse">🎤 Sedang merekam... Tap tombol mic untuk berhenti</p>
        )}
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

      {/* Analyze Button */}
      <button
        type="button"
        onClick={handleAnalyzeFood}
        disabled={isAnalyzing || (!description.trim() && !selectedImage)}
        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
        {isAnalyzing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Menganalisis dengan AI...
          </>
        ) : (
          <>
            <Brain className="h-4 w-4" />
            Analisis dengan AI
          </>
        )}
      </button>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="space-y-4">
      {analysisResult && (
        <>
          {/* Detected Foods */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">🍽️ Makanan Terdeteksi</h4>
            <div className="space-y-3">
              {analysisResult.detected_foods.map((food, index) => (
                <div key={`food-${index}`} className="bg-white rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-900">{food.name}</h5>
                    <span className="text-sm text-gray-600">
                      {food.portion} ({food.weight}g)
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{food.description}</p>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-orange-600">{Math.round(food.nutrition.calories)}</div>
                      <div className="text-gray-600">kcal</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">{Math.round(food.nutrition.protein)}g</div>
                      <div className="text-gray-600">protein</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{Math.round(food.nutrition.carbs)}g</div>
                      <div className="text-gray-600">karbo</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{Math.round(food.nutrition.fat)}g</div>
                      <div className="text-gray-600">lemak</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Nutrition */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">📊 Total Nutrisi</h4>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-orange-500">{Math.round(analysisResult.total_nutrition.calories)}</div>
                <div className="text-sm text-gray-600">Kalori</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-500">{Math.round(analysisResult.total_nutrition.protein)}g</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-500">{Math.round(analysisResult.total_nutrition.carbs)}g</div>
                <div className="text-sm text-gray-600">Karbo</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-500">{Math.round(analysisResult.total_nutrition.fat)}g</div>
                <div className="text-sm text-gray-600">Lemak</div>
              </div>
              <div>
                <div className="text-xl font-bold text-pink-500">{Math.round(analysisResult.total_nutrition.sugar)}g</div>
                <div className="text-sm text-gray-600">Gula</div>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="editableMealName" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Makanan *
              </label>
              <input
                type="text"
                id="editableMealName"
                value={editableMealName}
                onChange={(e) => setEditableMealName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nama makanan utama"
                required
              />
            </div>

            <div>
              <label htmlFor="editableDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi Lengkap
              </label>
              <textarea
                id="editableDescription"
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Deskripsi lengkap makanan"
              />
            </div>
          </div>

          {/* AI Confidence */}
          <div className="text-center text-sm text-gray-600">
            Confidence Level: {Math.round(analysisResult.confidence * 100)}%
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep("input")}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors">
              Kembali Edit
            </button>
            <button
              type="button"
              onClick={handleConfirmAnalysis}
              disabled={!editableMealName.trim()}
              className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Lanjut Konfirmasi
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">📝 Ringkasan Jurnal</h4>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Nama:</strong> {editableMealName}
          </div>
          <div>
            <strong>Jenis:</strong>{" "}
            {mealType === "breakfast"
              ? "Sarapan"
              : mealType === "lunch"
              ? "Makan Siang"
              : mealType === "dinner"
              ? "Makan Malam"
              : "Snack"}
          </div>
          <div>
            <strong>Deskripsi:</strong> {editableDescription}
          </div>
          {analysisResult && (
            <div className="pt-2 border-t">
              <strong>Total Kalori:</strong> {Math.round(analysisResult.total_nutrition.calories)} kcal
            </div>
          )}
        </div>
      </div>

      {/* Feelings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="feelingBefore" className="block text-xs font-medium text-gray-700 mb-1">
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
          <label htmlFor="feelingAfter" className="block text-xs font-medium text-gray-700 mb-1">
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

      {/* Final Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setCurrentStep("analysis")}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors">
          Kembali
        </button>
        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Menyimpan...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Simpan Jurnal
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Steps */}
      {currentStep === "input" && renderInputStep()}
      {currentStep === "analysis" && renderAnalysisStep()}
      {currentStep === "confirmation" && renderConfirmationStep()}

      {/* Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-700 mb-2">
          <strong>🤖 Smart Food Journal:</strong>
        </p>
        <ul className="text-sm text-blue-600 space-y-1">
          <li>
            • <strong>📝 Text:</strong> &quot;Nasi padang dengan rendang, sayur nangka, telur balado, porsi sedang&quot;
          </li>
          <li>
            • <strong>🎤 Voice:</strong> Ceritakan makanan secara natural seperti berbicara dengan teman
          </li>
          <li>
            • <strong>📸 Image:</strong> Foto makanan dari atas dengan pencahayaan yang baik
          </li>
          <li>
            • <strong>✨ AI akan analisis:</strong> Jenis makanan, kalori, protein, karbo, lemak, dan saran
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FoodJournalForm;
