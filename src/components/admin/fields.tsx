"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Trash2, Upload, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";

import type { ActionResult } from "@/app/admin/actions";
import { uploadFile } from "@/components/admin/upload";
import { cn } from "@/lib/format";

export const inputClass =
  "w-full rounded-xl border border-line/60 bg-cream px-4 py-2.5 text-[0.92rem] text-ink transition-colors placeholder:text-muted/60 focus:border-forest/50 focus:outline-none";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-ink block text-[0.85rem] font-medium">{label}</span>
      {children}
      {hint && <span className="text-muted block text-[0.75rem]">{hint}</span>}
    </label>
  );
}

/** Like Field, but for multi-control groups — a <label> would forward clicks to the first button. */
export function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="text-ink block text-[0.85rem] font-medium">{label}</span>
      {hint && <span className="text-muted -mt-1 block text-[0.75rem]">{hint}</span>}
      {children}
    </div>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="border-line/50 bg-cream-warm space-y-6 rounded-2xl border p-6 sm:p-8">
      {title && <h2 className="font-display text-ink text-[1.25rem] font-medium">{title}</h2>}
      {children}
    </section>
  );
}

export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-forest mt-0.5 size-4 shrink-0"
      />
      <span>
        <span className="text-ink block text-[0.9rem] font-medium">{label}</span>
        {hint && <span className="text-muted block text-[0.75rem]">{hint}</span>}
      </span>
    </label>
  );
}

/** Image by URL, or upload to Cloudinary through the server. */
export function ImageField({
  label,
  hint,
  value,
  onChange,
  aspect = "aspect-video",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      onChange(await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-ink block text-[0.85rem] font-medium">{label}</span>

      <div className={cn("border-line/60 bg-cream relative overflow-hidden rounded-xl border", aspect)}>
        {value ? (
          <>
            <Image src={value} alt="" fill sizes="480px" className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove image"
              className="bg-ink/70 text-cream hover:bg-ink absolute top-2 right-2 rounded-full p-1.5 transition-colors"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <div className="text-muted/60 flex h-full flex-col items-center justify-center gap-2">
            <ImageIcon className="size-8" strokeWidth={1.3} />
            <span className="text-[0.78rem]">No image yet</span>
          </div>
        )}
        {uploading && (
          <div className="bg-cream/80 absolute inset-0 flex items-center justify-center">
            <Loader2 className="text-forest size-6 animate-spin" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://… or upload"
          className={cn(inputClass, "min-w-0 flex-1 text-[0.82rem]")}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="border-line/60 bg-cream hover:bg-forest/5 inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 text-[0.82rem] font-medium transition-colors disabled:opacity-60"
        >
          <Upload className="size-4" />
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </div>
      {hint && !error && <span className="text-muted block text-[0.75rem]">{hint}</span>}
      {error && <span className="block text-[0.78rem] text-red-600">{error}</span>}
    </div>
  );
}

/** Sticky save/cancel row with inline error. */
export function FormActions({
  pending,
  error,
  saveLabel = "Save changes",
  onCancel,
  saved,
}: {
  pending: boolean;
  error: string | null;
  saveLabel?: string;
  onCancel?: () => void;
  saved?: boolean;
}) {
  return (
    <div className="border-line/50 bg-cream/90 sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center justify-end gap-3 border-t px-1 py-4 backdrop-blur-md">
      {error && <p className="mr-auto text-[0.85rem] text-red-600">{error}</p>}
      {saved && !error && <p className="text-forest mr-auto text-[0.85rem]">Saved — live on the site.</p>}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-ink hover:bg-forest/5 rounded-full px-5 py-2.5 text-[0.9rem] font-medium transition-colors"
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        disabled={pending}
        className="bg-forest text-cream hover:bg-forest-deep inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[0.9rem] font-medium transition-colors disabled:opacity-70"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {saveLabel}
      </button>
    </div>
  );
}

/** Confirm, run the delete action, then refresh the list in place. */
export function DeleteButton({
  action,
  label = "Delete",
  confirmText,
  redirectTo,
}: {
  action: () => Promise<ActionResult<unknown>>;
  label?: string;
  confirmText: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmText)) return;
        startTransition(async () => {
          const result = await action();
          if (!result.ok) {
            window.alert(result.error);
            return;
          }
          if (redirectTo) router.push(redirectTo);
          router.refresh();
        });
      }}
      className="inline-flex items-center gap-1.5 font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      {label}
    </button>
  );
}
