"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/format";

interface EnrollButtonProps {
  courseId: string;
  /** True when the signed-in user already owns this course. */
  owned: boolean;
  signedIn: boolean;
  dashboardHref: string;
  className?: string;
  label?: string;
}

/**
 * Buys a course. Payment is not wired yet — the backend records the enrollment
 * as settled — so this goes straight from click to owned.
 */
export function EnrollButton({
  courseId,
  owned,
  signedIn,
  dashboardHref,
  className,
  label = "Enroll Now",
}: EnrollButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "working" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const base = cn(
    "group inline-flex w-full items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[0.95rem] font-medium transition-colors duration-300 disabled:opacity-70",
    className,
  );

  if (owned) {
    return (
      <button
        type="button"
        onClick={() => router.push(dashboardHref)}
        className={cn(base, "bg-forest-deep text-cream hover:bg-forest")}
      >
        <Check className="size-4" aria-hidden="true" />
        Go to my course
      </button>
    );
  }

  async function handleClick() {
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setState("working");
    setError(null);

    const response = await fetch("/api/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? "Could not complete enrolment.");
      setState("idle");
      return;
    }

    setState("done");
    router.push(data.redirect);
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={state !== "idle"}
        className={cn(base, "bg-forest text-cream hover:bg-forest-deep")}
      >
        {state === "working" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Processing…
          </>
        ) : state === "done" ? (
          <>
            <Check className="size-4" />
            Enrolled
          </>
        ) : (
          <>
            {signedIn ? label : "Sign in to enrol"}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-center text-[0.8rem] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
