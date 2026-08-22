"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/format";

interface FieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** Rendered on the right of the label row, e.g. "Forgot password?". */
  action?: React.ReactNode;
}

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  value,
  onChange,
  error,
  action,
}: FieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-ink text-[0.85rem] font-medium">
          {label}
        </label>
        {action}
      </div>

      <div className="relative mt-2">
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "text-ink placeholder:text-muted/60 w-full rounded-xl border bg-white/60 px-4 py-3 text-[0.92rem] transition-colors outline-none",
            "focus:border-forest/50 focus:bg-white",
            isPassword && "pr-12",
            error ? "border-red-400/70" : "border-line",
          )}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((open) => !open)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="text-muted hover:text-forest absolute inset-y-0 right-0 flex w-12 items-center justify-center transition-colors"
          >
            {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-[0.78rem] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
