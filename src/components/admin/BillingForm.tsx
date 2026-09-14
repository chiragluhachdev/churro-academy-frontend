"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";

import { saveBillingAction } from "@/app/admin/actions";
import { Card, Field, FormActions, inputClass } from "@/components/admin/fields";
import type { BillingInfo } from "@/lib/api";

export function BillingForm({ initialData }: { initialData: BillingInfo }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<BillingInfo>(initialData);

  const set = <K extends keyof BillingInfo>(key: K, value: BillingInfo[K]) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveBillingAction({ ...form, companyName: form.companyName.trim() });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Card title="Seller details">
        <p className="text-muted -mt-2 text-[0.85rem]">
          Shown on every invoice a customer receives, and in the admin billing screen.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Company / legal name">
            <input required value={form.companyName} onChange={(e) => set("companyName", e.target.value)} className={inputClass} />
          </Field>
          <Field label="GSTIN">
            <input value={form.gstin} onChange={(e) => set("gstin", e.target.value.toUpperCase())} placeholder="06XXXXX0000X1Z0" className={inputClass} />
          </Field>
        </div>
        <Field label="Address" hint="Printed on the invoice.">
          <textarea rows={3} value={form.address} onChange={(e) => set("address", e.target.value)} className={inputClass} />
        </Field>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Support email">
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Support phone">
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="GST rate (%)" hint="Course prices are treated as already including this much GST." className="max-w-[10rem]">
          <input type="number" min={0} max={100} step={0.1} value={form.gstRate} onChange={(e) => set("gstRate", Number(e.target.value))} className={inputClass} />
        </Field>
      </Card>

      <FormActions pending={pending} error={error} saved={saved} saveLabel="Save changes" />
    </form>
  );
}
