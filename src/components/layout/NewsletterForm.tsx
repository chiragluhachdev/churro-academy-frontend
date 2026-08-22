"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

type Status = "idle" | "done" | "error";

/**
 * Phase 1 stub: validates locally and confirms, but nothing is persisted yet.
 * Wire the submit handler to `POST /api/newsletter` once the backend lands.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("done");
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-5">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="border-cream/25 focus-within:border-cream/60 flex items-center gap-2 rounded-full border py-1.5 pr-1.5 pl-5 transition-colors">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          placeholder="Enter your email"
          autoComplete="email"
          aria-invalid={status === "error"}
          aria-describedby="newsletter-status"
          className="text-cream placeholder:text-cream/45 min-w-0 flex-1 bg-transparent py-2 text-[0.88rem] outline-none"
        />
        <button
          type="submit"
          aria-label="Subscribe to the newsletter"
          className="bg-cream text-forest flex size-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 hover:scale-105"
        >
          {status === "done" ? (
            <Check className="size-4" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </button>
      </div>

      <p
        id="newsletter-status"
        role="status"
        aria-live="polite"
        className="text-cream/70 mt-2.5 min-h-[1.25rem] text-[0.78rem]"
      >
        {status === "done" && "Thanks — you're on the list."}
        {status === "error" && "Please enter a valid email address."}
      </p>
    </form>
  );
}
