"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-white/10 z-50 flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-blue-300" />
    </div>
  );
};
