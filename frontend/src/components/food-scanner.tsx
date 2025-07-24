"use client";

import React, { useState, useRef, useEffect } from "react";
import api from "@/utils/axios";
import { ScannerSelection } from "./scanner-selection";
import { Camera, X, FolderOpen } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { FoodScannerProps, ScannerType } from "@/types/scanner.types";

export function FoodScanner({ onBarcodeResult, onImageResult, onReceiptResult, onClose }: FoodScannerProps) {
  const [mode, setMode] = useState<"selection" | "camera">("selection");
  const [scannerType, setScannerType] = useState<ScannerType | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
              // Generate unique filename tanpa Date.now() untuk avoid hydration issues
              const randomId = Math.random().toString(36).substring(2, 15);
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              const file = new File([blob], `capture_${randomId}_${timestamp}.jpg`, {
                type: "image/jpeg",
                lastModified: new Date().getTime(),
              });

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

  const handleSelect = async (type: ScannerType) => {
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
    if (onClose) {
      onClose();
    } else {
      setMode("selection");
      setScannerType(null);
    }
  };

  const scanBarcode = async (barcode: string) => {
    try {
      if (scanningIntervalRef.current) {
        clearInterval(scanningIntervalRef.current);
        scanningIntervalRef.current = null;
      }

      setIsLoading(true);

      const response = await api.post(
        `/product-info/${barcode}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Handle response wrapper dari backend
      if (response.data.success && response.data.data) {
        const result = {
          name: response.data.data.name,
          barcode: response.data.data.barcode,
        };

        console.log("Barcode scan result:", result);
        onBarcodeResult?.(result);
        handleCloseCamera();
      } else {
        alert("Failed to get product info");
        setTimeout(() => {
          startBarcodeScanning();
        }, 1000);
      }
    } catch (error) {
      console.error("Barcode scan error:", error);

      let errorMessage = "Gagal scan barcode. Silakan coba lagi.";
      if (error && typeof error === "object" && "response" in error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosError = error as any;
        errorMessage = axiosError.response?.data?.error || axiosError.message || "Failed to get product info";
      }
      alert(`Error: ${errorMessage}`);

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

      const response = await api.post("/predict/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data;

      if (result && result.item_name) {
        console.log("Image prediction result:", result);
        onImageResult?.(result);
        handleCloseCamera();
      } else {
        alert("Failed to predict item from image - invalid response");
      }
    } catch (error) {
      console.error("Image prediction error:", error);

      let errorMessage = "Gagal memprediksi item dari gambar.";
      if (error && typeof error === "object" && "response" in error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosError = error as any;
        errorMessage = axiosError.response?.data?.error || axiosError.message || "Failed to predict item from image";
      }
      alert(`Error: ${errorMessage}`);
    }
  };

  const analyzeReceipt = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/receipt/scan", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data;

      if (result && result.success && result.data) {
        console.log("Receipt analysis result:", result.data);
        onReceiptResult?.(result.data); 
        handleCloseCamera();
      } else {
        alert("Failed to analyze receipt");
      }
    } catch (error) {
      console.error("Receipt analysis error:", error);

      let errorMessage = "Gagal menganalisis struk.";
      if (error && typeof error === "object" && "response" in error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosError = error as any;
        errorMessage = axiosError.response?.data?.error || axiosError.message || "Failed to analyze receipt";
      }
      alert(`Error: ${errorMessage}`);
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

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih file gambar (JPG, PNG, dll.)");
      return;
    }

    setIsLoading(true);

    try {
      if (scannerType === "image") {
        await predictItemFromImage(file);
      } else if (scannerType === "receipt") {
        await analyzeReceipt(file);
      } else if (scannerType === "barcode") {
        await processBarcodeImage(file);
      }
    } catch (error) {
      console.error("File processing error:", error);
      alert("Gagal memproses file. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      {mode === "selection" ? (
        <ScannerSelection onSelect={handleSelect} onClose={onClose || (() => {})} />
      ) : (
        <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
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

          {/* Main content */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Camera/Video section */}
            <div className="flex-1 relative flex items-center justify-center bg-black lg:h-full">
              <div className="relative w-full h-full max-w-2xl max-h-96 lg:max-h-full">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />

                {!isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/75 text-white p-4 rounded-lg flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                      <p>Memuat kamera...</p>
                    </div>
                  </div>
                )}

                {scannerType === "barcode" && isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-white border-dashed w-3/5 h-2/5 rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className={`${isScanning ? "animate-pulse" : ""}`}>
                          {isScanning ? "🔍 Scanning..." : "Posisikan barcode di sini"}
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
                    <div className="bg-black/75 text-white p-3 rounded-lg">
                      {scannerType === "image"
                        ? "Posisikan produk dalam frame dan tekan tombol foto"
                        : "Posisikan struk dalam frame dan tekan tombol foto"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls section */}
            <div className="lg:w-80 bg-gray-900 flex flex-col justify-center p-6">
              <div className="space-y-4">
                <h3 className="text-white text-lg font-semibold text-center mb-6">Pilih Sumber</h3>

                {/* Camera capture button */}
                {isCameraReady && (
                  <button
                    onClick={captureImage}
                    disabled={isLoading || isCapturing}
                    className={`w-full flex items-center justify-center gap-3 p-4 rounded-lg transition-colors ${
                      isLoading || isCapturing ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}>
                    {isLoading || isCapturing ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <Camera size={24} className="text-white" />
                    )}
                    <span className="text-white font-medium">{isLoading || isCapturing ? "Memproses..." : "Ambil Foto"}</span>
                  </button>
                )}

                {/* File upload button */}
                <button
                  onClick={handleFileSelect}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-3 p-4 rounded-lg transition-colors ${
                    isLoading ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                  }`}>
                  <FolderOpen size={24} className="text-white" />
                  <span className="text-white font-medium">Pilih File</span>
                </button>

                {/* Cancel button */}
                <button
                  onClick={handleCloseCamera}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-3 p-4 rounded-lg transition-colors ${
                    isLoading ? "bg-gray-700 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}>
                  <X size={24} className="text-white" />
                  <span className="text-white font-medium">Batal</span>
                </button>

                {/* Info text */}
                <div className="text-gray-300 text-sm text-center mt-6">
                  <p>Anda dapat mengambil foto langsung dari kamera atau memilih file dari perangkat Anda.</p>
                </div>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-10">
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

          {/* Hidden file input */}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      )}
    </div>
  );
}
