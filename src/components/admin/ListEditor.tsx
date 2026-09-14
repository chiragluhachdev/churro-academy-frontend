"use client";

import { Plus, X } from "lucide-react";

import { inputClass } from "@/components/admin/fields";

/** A simple editable list of short lines. */
export function StringListEditor({ value, onChange, placeholder, addLabel }: { value: string[]; onChange: (next: string[]) => void; placeholder: string; addLabel: string }) {
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input value={item} onChange={(e) => onChange(value.map((v, idx) => (idx === i ? e.target.value : v)))} placeholder={placeholder} className={inputClass} />
          <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Remove" className="text-muted hover:text-red-600 shrink-0 px-2">
            <X className="size-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ""])} className="text-forest inline-flex items-center gap-1.5 text-[0.85rem] font-medium">
        <Plus className="size-4" />
        {addLabel}
      </button>
    </div>
  );
}

export function FaqEditor({ value, onChange }: { value: { question: string; answer: string }[]; onChange: (next: { question: string; answer: string }[]) => void }) {
  return (
    <div className="space-y-3">
      {value.map((faq, i) => (
        <div key={i} className="border-line/60 bg-cream space-y-2 rounded-xl border p-3">
          <div className="flex gap-2">
            <input value={faq.question} onChange={(e) => onChange(value.map((f, idx) => (idx === i ? { ...f, question: e.target.value } : f)))} placeholder="Question" className={inputClass} />
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Remove question" className="text-muted hover:text-red-600 shrink-0 px-2">
              <X className="size-4" />
            </button>
          </div>
          <textarea rows={2} value={faq.answer} onChange={(e) => onChange(value.map((f, idx) => (idx === i ? { ...f, answer: e.target.value } : f)))} placeholder="Answer" className={inputClass} />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { question: "", answer: "" }])} className="text-forest inline-flex items-center gap-1.5 text-[0.85rem] font-medium">
        <Plus className="size-4" />
        Add question
      </button>
    </div>
  );
}
