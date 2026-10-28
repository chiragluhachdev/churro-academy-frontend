"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

import { cn } from "@/lib/format";

/**
 * Admin sign-ins end 10 minutes after login. This counts down and, at zero,
 * sends the admin to the public site. The server would refuse the next admin
 * request anyway; this just doesn't leave a dead page open.
 */
export function SessionTimer({ endsAt, className }: { endsAt: number; className?: string }) {
  const router = useRouter();
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const ms = endsAt - Date.now();
      if (ms <= 0) {
        router.replace("/");
        return;
      }
      setLeft(ms);
    };
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [endsAt, router]);

  if (left === null) return null;
  const total = Math.ceil(left / 1000);
  const label = `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;

  return (
    <p
      className={cn("flex items-center gap-1.5 text-[0.72rem] tabular-nums", total <= 60 ? "text-[var(--color-gold)]" : "text-cream/55", className)}
      title="Admin sign-ins end 10 minutes after logging in"
    >
      <Timer className="size-3.5" strokeWidth={1.8} />
      Signs out in {label}
    </p>
  );
}
