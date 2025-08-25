"use client";

import { ElementType } from "react";

export default function ChatHeader({
  title,
  subtitle,
  Icon,
}: {
  title: string;
  subtitle?: string;
  Icon?: ElementType;
}) {
  return (
    <header className="relative py-3 md:py-4">
      <div className="flex items-center gap-3">
        {Icon ? (
          <div className="h-10 w-10 rounded-md border border-slate-200 flex items-center justify-center shadow-sm">
            <Icon size={18} />
          </div>
        ) : null}
        <div>
          <h1 className="text-base md:text-lg font-semibold text-gray-900">{title}</h1>
          {subtitle ? (
            <p className="text-[11px] md:text-xs text-gray-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
