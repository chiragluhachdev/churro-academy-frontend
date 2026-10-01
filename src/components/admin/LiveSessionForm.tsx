"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { Loader2, Radio } from "lucide-react";

import { createLiveSessionAction } from "@/app/admin/actions";
import { Card, Field, inputClass } from "@/components/admin/fields";

/** Announces a live class and emails every paid student the moment it's sent — there's no draft state. */
export function LiveSessionForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [form, setForm] = useState({ title: "", description: "", link: "", date: "", time: "" });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!form.link.trim() || !/^https?:\/\//i.test(form.link.trim())) {
      setError("The session link must start with https://.");
      return;
    }
    if (!form.date || !form.time) {
      setError("Pick a date and time for the session.");
      return;
    }
    const scheduledAt = new Date(`${form.date}T${form.time}`);
    if (Number.isNaN(scheduledAt.getTime())) {
      setError("That date and time don't look right.");
      return;
    }
    if (!window.confirm("This emails every student who has ever purchased a course, right now. Send it?")) {
      return;
    }

    startTransition(async () => {
      const res = await createLiveSessionAction({
        title: form.title.trim(),
        description: form.description.trim(),
        link: form.link.trim(),
        scheduledAt: scheduledAt.toISOString(),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult({ sent: res.data.recipientCount, failed: res.data.failedCount });
      setForm({ title: "", description: "", link: "", date: "", time: "" });
      router.refresh();
    });
  }

  return (
    <Card title="Announce a live session">
      <p className="text-muted -mt-2 text-[0.85rem]">
        Sends an email to every student who has ever paid for a course — with the title, details, date, time
        and link below. There&rsquo;s no scheduling queue: this goes out the moment you hit send.
      </p>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Field label="Session title">
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Live Q&A: Laminated Doughs"
            className={inputClass}
          />
        </Field>
        <Field label="Details" hint="A line or two — what it's about, what to bring, anything useful.">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="Date">
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Time" hint="IST">
            <input
              required
              type="time"
              value={form.time}
              onChange={(e) => set("time", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Session link" className="sm:col-span-1">
            <input
              required
              type="url"
              value={form.link}
              onChange={(e) => set("link", e.target.value)}
              placeholder="https://meet.google.com/…"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line/50 pt-4">
          {error && <p className="mr-auto text-[0.85rem] text-red-600">{error}</p>}
          {result && !error && (
            <p className="text-forest mr-auto text-[0.85rem]">
              Sent to {result.sent} student{result.sent === 1 ? "" : "s"}
              {result.failed > 0 ? ` — ${result.failed} failed to send.` : "."}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="bg-forest text-cream hover:bg-forest-deep inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[0.9rem] font-medium transition-colors disabled:opacity-70"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Radio className="size-4" />}
            {pending ? "Sending…" : "Send to every student"}
          </button>
        </div>
      </form>
    </Card>
  );
}
