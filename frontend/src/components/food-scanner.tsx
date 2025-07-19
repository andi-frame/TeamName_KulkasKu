"use client";

import React, { useState, useRef, useEffect } from "react";
import { ScannerSelection } from "./scanner-selection";
import { Camera, X } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface FoodScannerProps {
  onBarcodeResult?: (result: { name: string; barcode: string }) => void;
  onImageResult?: (result: {
    item_name: string;
    predicted_remaining_days: number;
    expiry_date: string;
    reasoning: string;
  }) => void;
  onReceiptResult?: (result: { items: ReceiptItem[]; total_items: number; confidence: number }) => void;
}

interface ReceiptItem {
  name: string;
  quantity: number;
  price?: number;
}

export function FoodScanner({ onBarcodeResult, onImageResult, onReceiptResult }: FoodScannerProps) {
  const [mode, setMode] = useState<"selection" | "camera">("selection");
  const [scannerType, setScannerType] = useState<"barcode" | "image" | "receipt" | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && mode === "camera") {
        cleanup();
        setMode("selection");
        setScannerType(null);
      }
    };

    const handleBeforeUnload = () => {
      cleanup();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [mode]);

  const cleanup = () => {
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current);
      scanningIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (codeReaderRef.current) {
      codeReaderRef.current = null;
    }

    setIsScanning(false);
    setIsCameraReady(false);
  };

  const startCamera = async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        return new Promise((resolve) => {
          const onLoadedMetadata = () => {
            setIsCameraReady(true);
            setIsLoading(false);
            videoRef.current?.removeEventListener("loadedmetadata", onLoadedMetadata);
            resolve(true);
          };

          videoRef.current?.addEventListener("loadedmetadata", onLoadedMetadata);

          setTimeout(() => {
            setIsCameraReady(true);
            setIsLoading(false);
            resolve(true);
          }, 2000);
        });
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Camera access error:", error);
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
      setIsLoading(false);
      setMode("selection");
      return false;
    }
  };

  const startBarcodeScanning = async () => {
    if (!videoRef.current || !isCameraReady) return;

    try {
      setIsScanning(true);
      codeReaderRef.current = new BrowserMultiFormatReader();

      const scanLoop = () => {
        if (!codeReaderRef.current || !videoRef.current || mode !== "camera") {
          return;
        }

        codeReaderRef.current
          .decodeOnceFromVideoDevice(undefined, videoRef.current)
          .then((result) => {
            if (result) {
              console.log("Barcode detected:", result.getText());
              scanBarcode(result.getText());
            }
          })
          .catch(() => {});
      };
      scanningIntervalRef.current = setInterval(scanLoop, 500);
    } catch (error) {
      console.error("Barcode scanning error:", error);
      alert("Error memulai scanner barcode. Silakan coba lagi.");
      setIsScanning(false);
    }
  };

  const captureImage = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !isCameraReady) {
      alert("Camera belum siap. Silakan tunggu sebentar.");
      return;
    }

    setIsCapturing(true);
    setIsLoading(true);

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);

        canvas.toBlob(
          async (blob) => {
            if (blob) {
              const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

              try {
                if (scannerType === "image") {
                  await predictItemFromImage(file);
                } else if (scannerType === "receipt") {
                  await analyzeReceipt(file);
                } else if (scannerType === "barcode") {
                  await processBarcodeImage(file);
                }
              } catch (error) {
                console.error("Processing error:", error);
                alert("Gagal memproses gambar. Silakan coba lagi.");
              }
            } else {
              alert("Gagal mengambil foto. Silakan coba lagi.");
            }
          },
          "image/jpeg",
          0.9
        );
      }
    } catch (error) {
      console.error("Capture error:", error);
      alert("Gagal mengambil foto. Silakan coba lagi.");
    } finally {
      setIsCapturing(false);
      setIsLoading(false);
    }
  };

  const handleSelect = async (type: "barcode" | "image" | "receipt") => {
    console.log(`${type} scanner selected`);
    setScannerType(type);
    setMode("camera");

    const cameraStarted = await startCamera();

    if (cameraStarted && type === "barcode") {
      setTimeout(() => {
        startBarcodeScanning();
      }, 1500);
    }
  };

  const handleCloseCamera = () => {
    cleanup();
    setMode("selection");
    setScannerType(null);
  };

  const scanBarcode = async (barcode: string) => {
    try {
      if (scanningIntervalRef.current) {
        clearInterval(scanningIntervalRef.current);
        scanningIntervalRef.current = null;
      }

      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/product-info/${barcode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result) {
        console.log("Barcode scan result:", result);
        onBarcodeResult?.(result);
        handleCloseCamera();
      } else {
        alert(`Error: ${result?.error || "Failed to get product info"}`);
        setTimeout(() => {
          startBarcodeScanning();
        }, 1000);
      }
    } catch (error) {
      console.error("Barcode scan error:", error);
      alert("Gagal scan barcode. Silakan coba lagi.");
      setTimeout(() => {
        startBarcodeScanning();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const predictItemFromImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5000/predict/image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result) {
        console.log("Image prediction result:", result);
        onImageResult?.(result);
        handleCloseCamera();
      } else {
        alert(`Error: ${result?.error || "Failed to predict item from image"}`);
      }
    } catch (error) {
      console.error("Image prediction error:", error);
      alert("Gagal memprediksi item dari gambar.");
    }
  };

  const analyzeReceipt = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5000/receipt/scan", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result) {
        console.log("Receipt analysis result:", result);
        onReceiptResult?.(result);
        handleCloseCamera();
      } else {
        alert(`Error: ${result?.error || "Failed to analyze receipt"}`);
      }
    } catch (error) {
      console.error("Receipt analysis error:", error);
      alert("Gagal menganalisis struk.");
    }
  };

  const processBarcodeImage = async (file: File) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        try {
          const codeReader = new BrowserMultiFormatReader();
          const result = await codeReader.decodeFromCanvas(canvas);

          if (result) {
            console.log("Barcode from image:", result.getText());
            await scanBarcode(result.getText());
          } else {
            alert("Tidak ada barcode yang terdeteksi dalam gambar.");
          }
        } catch (error) {
          console.error("Barcode decode error:", error);
          alert("Tidak ada barcode yang terdeteksi dalam gambar.");
        }
      };

      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error("Barcode image processing error:", error);
      alert("Gagal memproses gambar barcode.");
    }
  };

  return (
    <div>
      {mode === "selection" ? (
        <ScannerSelection onSelect={handleSelect} />
      ) : (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-black text-white">
            <h2 className="text-lg font-semibold">
              {scannerType === "barcode" ? "Scan Barcode" : scannerType === "image" ? "Foto Produk" : "Foto Struk"}
            </h2>
            <button
              onClick={handleCloseCamera}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              disabled={isLoading}>
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="max-w-full max-h-full object-contain" />

            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-75 text-white p-4 rounded-lg flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                  <p>Memuat kamera...</p>
                </div>
              </div>
            )}

            {scannerType === "barcode" && isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white border-dashed w-64 h-32 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className={`${isScanning ? "animate-pulse" : ""}`}>
                      {isScanning ? "🔍 Scanning..." : "📱 Posisikan barcode di sini"}
                    </div>
                    <div className="text-sm mt-2 opacity-75">
                      {isScanning ? "Jaga kamera tetap stabil" : "Auto-scan atau tekan tombol 📷"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(scannerType === "image" || scannerType === "receipt") && isCameraReady && (
              <div className="absolute top-4 left-4 right-4 text-center">
                <div className="bg-black bg-opacity-75 text-white p-3 rounded-lg">
                  {scannerType === "image"
                    ? "Posisikan produk dalam frame dan tekan tombol foto"
                    : "Posisikan struk dalam frame dan tekan tombol foto"}
                </div>
              </div>
            )}
          </div>

          {isCameraReady && (
            <div className="p-6 bg-black flex justify-center space-x-4">
              <button
                onClick={captureImage}
                disabled={isLoading || isCapturing}
                className={`rounded-full p-4 transition-colors shadow-lg ${
                  isLoading || isCapturing ? "bg-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-200"
                }`}
                title={isLoading ? "Memproses..." : "Ambil Foto"}>
                {isLoading || isCapturing ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                ) : (
                  <Camera size={32} className="text-black" />
                )}
              </button>

              <button
                onClick={handleCloseCamera}
                disabled={isLoading}
                className={`rounded-full p-4 transition-colors shadow-lg ${
                  isLoading ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
                title="Batal">
                <X size={32} className="text-white" />
              </button>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
              <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-700 font-medium">
                  {scannerType === "image"
                    ? "Menganalisis gambar..."
                    : scannerType === "receipt"
                    ? "Memproses struk..."
                    : "Memproses barcode..."}
                </p>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      )}
    </div>
  );
}
