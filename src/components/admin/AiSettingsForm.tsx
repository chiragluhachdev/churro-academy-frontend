"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";

import { saveAiSettingsAction } from "@/app/admin/actions";
import { Card, Field, FormActions, Toggle, inputClass } from "@/components/admin/fields";
import type { AiConfig } from "@/lib/churroaiShared";

type NumberKey = "passPrice" | "passDays" | "freeTries" | "trialMinutes";

export function AiSettingsForm({ initialData }: { initialData: AiConfig }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [enabled, setEnabled] = useState(initialData.calculatorEnabled);
  const [passName, setPassName] = useState(initialData.passName);
  const [demoOtp, setDemoOtp] = useState(initialData.demoOtp);
  // Kept as text while editing so a field can be cleared and retyped.
  const [nums, setNums] = useState<Record<NumberKey, string>>({
    passPrice: String(initialData.passPrice),
    passDays: String(initialData.passDays),
    freeTries: String(initialData.freeTries),
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
        freeTries: Number(nums.freeTries),
        trialMinutes: Number(nums.trialMinutes),
        demoOtp: demoOtp.trim(),
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
          hint="Off shows “opening soon” to everyone signed in, and “Get early access” on the Churro AI page. You can always preview it as admin."
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
          <Field label="Pass length (days)" hint="365 = one year.">
            {numberInput("passDays", 1)}
          </Field>
        </div>
      </Card>

      <Card title="Free try">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Free tries per member" hint="0 turns the free try off — straight to paying.">
            {numberInput("freeTries", 0)}
          </Field>
          <Field label="Each free try lasts (minutes)" hint="Starts when the member clicks “Start my free try”.">
            {numberInput("trialMinutes", 1)}
          </Field>
        </div>
      </Card>

      <Card title="Sign-in">
        <Field
          label="Demo login code"
          hint="Text messages aren’t connected yet, so every number signs in with this code — it’s shown on the sign-in screen. Replace this with real SMS before a wide launch."
          className="max-w-xs"
        >
          <input
            inputMode="numeric"
            value={demoOtp}
            onChange={(e) => {
              touched();
              setDemoOtp(e.target.value.replace(/\D/g, ""));
            }}
            className={`${inputClass} font-mono tracking-widest`}
          />
        </Field>
      </Card>

      <FormActions pending={pending} error={error} saved={saved} saveLabel="Save changes" />
    </form>
  );
}
