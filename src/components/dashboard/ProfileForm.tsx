"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { Field } from "@/components/auth/Field";
import { student } from "@/data/student";

/** Frontend-only: edits stay in local state until the account API exists. */
export function ProfileForm() {
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-md space-y-5">
      <Field label="Full name" name="name" value={name} onChange={setName} autoComplete="name" />
      <Field
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
      />

      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          className="bg-forest text-cream hover:bg-forest-deep inline-flex rounded-full px-6 py-3 text-[0.9rem] font-medium transition-colors duration-300"
        >
          Save changes
        </button>
        <p role="status" aria-live="polite" className="text-forest text-[0.82rem]">
          {saved && (
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4" aria-hidden="true" />
              Saved locally
            </span>
          )}
        </p>
      </div>

      <p className="text-muted text-[0.75rem] leading-relaxed">
        Demo build — changes aren&rsquo;t persisted yet, so they reset on reload.
      </p>
    </form>
  );
}
