"use client";

import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { useState, useTransition } from "react";

import { resendOrderEmailAction } from "@/app/admin/actions";

export function ResendEmailButton({ orderId, label = "Resend email" }: { orderId: string; label?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function resend() {
    setError(null);
    startTransition(async () => {
      const result = await resendOrderEmailAction(orderId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={resend}
        disabled={pending}
        className="border-forest/30 text-forest hover:bg-forest/5 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[0.85rem] font-medium transition-colors disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {label}
      </button>
      {error && <p className="max-w-xs text-right text-[0.75rem] text-red-600">{error}</p>}
    </div>
  );
}
