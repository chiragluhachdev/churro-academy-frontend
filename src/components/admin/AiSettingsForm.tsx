"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";

import { saveAiSettingsAction } from "@/app/admin/actions";
import { Card, Field, FormActions, Toggle, inputClass } from "@/components/admin/fields";
import type { AiConfig } from "@/lib/churroaiShared";

type NumberKey = "passPrice" | "passDays" | "trialMinutes";

export function AiSettingsForm({ initialData }: { initialData: AiConfig }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [enabled, setEnabled] = useState(initialData.calculatorEnabled);
  const [passName, setPassName] = useState(initialData.passName);
  const [autoRenew, setAutoRenew] = useState(initialData.autoRenewEnabled);
  // Kept as text while editing so a field can be cleared and retyped.
  const [nums, setNums] = useState<Record<NumberKey, string>>({
    passPrice: String(initialData.passPrice),
    passDays: String(initialData.passDays),
    trialMinutes: String(initialData.trialMinutes),
  });

  const touched = () => setSaved(false);
  const setNum = (key: NumberKey, value: string) => {
    touched();
    setNums((prev) => ({ ...prev, [key]: value }));
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveAiSettingsAction({
        calculatorEnabled: enabled,
        passName: passName.trim(),
        passPrice: Number(nums.passPrice),
        passDays: Number(nums.passDays),
        // Every email gets one free try; only its length is set here.
        freeTries: 1,
        trialMinutes: Number(nums.trialMinutes),
        autoRenewEnabled: autoRenew,
      });
      if (!result.ok) return setError(result.error);
      setSaved(true);
      router.refresh();
    });
  }

  const numberInput = (key: NumberKey, min: number) => (
    <input type="number" min={min} value={nums[key]} onChange={(e) => setNum(key, e.target.value)} className={inputClass} />
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Card title="Recipe Calculator">
        <Toggle
          label="Open to members"
          hint="Off shows “opening soon” to members once they sign in. You can always preview it as admin."
          checked={enabled}
          onChange={(v) => {
            touched();
            setEnabled(v);
          }}
        />
      </Card>

      <Card title="Pass & pricing">
        <div className="grid gap-6 md:grid-cols-3">
          <Field label="Pass name" hint="On the paywall, invoice and email.">
            <input
              value={passName}
              onChange={(e) => {
                touched();
                setPassName(e.target.value);
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Price (₹)" hint="Whole rupees, GST included.">
            {numberInput("passPrice", 1)}
          </Field>
          <Field label="Pass length (days)" hint="30 = monthly, 365 = yearly.">
            {numberInput("passDays", 1)}
          </Field>
        </div>
        <Toggle
          label="Offer auto-renewal"
          hint="Buyers can choose to be charged automatically every period by UPI Autopay or card (Razorpay Subscriptions), or pay once. Needs Subscriptions switched on in your Razorpay account. A price change applies to new subscribers; existing ones keep their price."
          checked={autoRenew}
          onChange={(v) => {
            touched();
            setAutoRenew(v);
          }}
        />
      </Card>

      <Card title="Free try">
        <Field
          label="Free try length (minutes)"
          hint="Every email gets one free try of this length, starting when they click “Start my free try”. A change applies to tries started after you save."
          className="max-w-sm"
        >
          {numberInput("trialMinutes", 1)}
        </Field>
      </Card>

      <FormActions pending={pending} error={error} saved={saved} saveLabel="Save changes" />
    </form>
  );
}
