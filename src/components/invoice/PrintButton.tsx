"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border-forest/30 text-forest hover:bg-forest/5 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[0.85rem] font-medium transition-colors print:hidden"
    >
      <Printer className="size-4" />
      Print / Save as PDF
    </button>
  );
}
