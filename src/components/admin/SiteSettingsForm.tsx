"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { AlertTriangle } from "lucide-react";

import { saveSiteSettingsAction } from "@/app/admin/actions";
import { Card, Field, FormActions, Toggle, inputClass } from "@/components/admin/fields";
import { SALES_PAUSED_DEFAULT_MESSAGE, type SiteSettings } from "@/lib/api";

export function SiteSettingsForm({ initialData }: { initialData: SiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<SiteSettings>(initialData);
  // Tracks the last-saved state, not the page's initial load, so the confirm
  // below only fires on a genuine off -> on flip, not on every save while
  // maintenance is already on.
  const [lastSavedEnabled, setLastSavedEnabled] = useState(initialData.maintenanceEnabled);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (form.maintenanceEnabled && !lastSavedEnabled) {
      if (!window.confirm("This takes the live site down for every visitor right now, except you. Continue?")) {
        return;
      }
    }

    startTransition(async () => {
      const result = await saveSiteSettingsAction({
        ...form,
        maintenanceMessage: form.maintenanceMessage.trim(),
        salesPausedMessage: form.salesPausedMessage.trim(),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLastSavedEnabled(form.maintenanceEnabled);
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Card title="Maintenance mode">
        <p className="text-muted -mt-2 text-[0.85rem]">
          Replaces the live site with a &ldquo;we&rsquo;ll be back soon&rdquo; page for every visitor. You&rsquo;ll
          still see the real site and the admin dashboard while signed in, so you can turn it back off.
        </p>

        {form.maintenanceEnabled && (
          <div className="border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 flex items-start gap-2.5 rounded-xl border px-4 py-3">
            <AlertTriangle className="text-[var(--color-gold)] mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
            <p className="text-ink text-[0.82rem] leading-snug">
              The site is currently showing the maintenance page to everyone else.
            </p>
          </div>
        )}

        <Toggle
          label="Site closed for maintenance"
          hint="Turn this on to take the public site offline."
          checked={form.maintenanceEnabled}
          onChange={(v) => set("maintenanceEnabled", v)}
        />

        <Field label="Message" hint="Optional — shown on the maintenance page. Leave blank for the default copy.">
          <textarea
            rows={3}
            value={form.maintenanceMessage}
            onChange={(e) => set("maintenanceMessage", e.target.value)}
            placeholder="We'll be back soon — we're making some updates."
            className={inputClass}
          />
        </Field>
      </Card>

      <Card title="Course sales">
        <p className="text-muted -mt-2 text-[0.85rem]">
          Stops anyone buying a course. The rest of the site stays up — course pages show &ldquo;Currently
          unavailable&rdquo; with your message and a WhatsApp contact button instead of &ldquo;Enroll Now&rdquo;.
          Anyone already mid-payment can still finish.
        </p>
        {form.salesPaused && (
          <div className="border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 flex items-start gap-2.5 rounded-xl border px-4 py-3">
            <AlertTriangle className="text-[var(--color-gold)] mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
            <p className="text-ink text-[0.82rem] leading-snug">Course sales are paused — nobody can buy a course.</p>
          </div>
        )}
        <Toggle
          label="Pause course sales"
          hint="Turn off to start selling again."
          checked={form.salesPaused}
          onChange={(v) => set("salesPaused", v)}
        />
        <Field label="Message" hint="Optional — shown on course pages. Leave blank for the default.">
          <textarea
            rows={2}
            value={form.salesPausedMessage}
            onChange={(e) => set("salesPausedMessage", e.target.value)}
            placeholder={SALES_PAUSED_DEFAULT_MESSAGE}
            className={inputClass}
          />
        </Field>
      </Card>

      <FormActions pending={pending} error={error} saved={saved} saveLabel="Save changes" />
    </form>
  );
}
