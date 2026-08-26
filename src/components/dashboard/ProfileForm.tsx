"use client";

import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import type { FormEvent } from "react";

import { Field } from "@/components/auth/Field";

export function ProfileForm({
  initialName,
  initialUsername,
  email,
}: {
  initialName: string;
  initialUsername: string;
  email: string;
}) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);

    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? "Could not save changes.");
      setStatus("idle");
      return;
    }

    // The username is baked into the backend JWT, so fold the refreshed token
    // into the session as well as the new name.
    await update({
      user: { name: data.user.name, username: data.user.username },
      accessToken: data.token,
    });
    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 2600);

    if (data.user.username !== initialUsername) {
      router.replace(`/${data.user.username}/dashboard/profile`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-md space-y-5">
      <Field label="Full name" name="name" value={name} onChange={setName} autoComplete="name" />
      <Field
        label="Username"
        name="username"
        value={username}
        onChange={setUsername}
        error={error ?? undefined}
      />
      <p className="text-muted -mt-2 text-[0.75rem]">
        Your dashboard lives at <span className="text-ink">/{username || "…"}/dashboard</span>
      </p>
      <Field label="Email" name="email" type="email" value={email} onChange={() => {}} />
      <p className="text-muted -mt-2 text-[0.75rem]">Email changes aren&rsquo;t supported yet.</p>

      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={status === "saving"}
          className="bg-forest text-cream hover:bg-forest-deep inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.9rem] font-medium transition-colors duration-300 disabled:opacity-70"
        >
          {status === "saving" && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </button>
        <p role="status" aria-live="polite" className="text-forest text-[0.82rem]">
          {status === "saved" && (
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4" aria-hidden="true" />
              Saved
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
