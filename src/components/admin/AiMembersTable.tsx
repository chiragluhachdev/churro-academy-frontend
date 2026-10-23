"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { aiMemberAction } from "@/app/admin/actions";
import { formatPhone, type AiMember } from "@/lib/churroaiShared";
import { cn, formatDate } from "@/lib/format";

const STATUS: Record<AiMember["access"], [string, string]> = {
  pass: ["Pass active", "bg-forest/10 text-forest"],
  trial: ["On free try", "bg-[var(--color-gold)]/20 text-ink"],
  trial_available: ["Free try unused", "bg-pill text-ink"],
  locked: ["Free try used", "bg-line/60 text-muted"],
};

const ACTIONS = {
  grant: { label: "Give pass", confirm: "Give this member a free pass?" },
  revoke: { label: "Remove access", confirm: "End this member's pass and any free try running now? Their payments stay in Billing." },
  "reset-trial": { label: "Reset free try", confirm: "Give this member their free tries back?" },
} as const;

type Action = keyof typeof ACTIONS;

/** Only the actions that would change something for this member. */
function applicableActions(m: AiMember): Action[] {
  const actions: Action[] = ["grant"];
  if (m.freeTriesUsed > 0) actions.push("reset-trial");
  if (m.access === "pass" || m.access === "trial") actions.push("revoke");
  return actions;
}

export function AiMembersTable({ members }: { members: AiMember[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function act(member: AiMember, action: Action) {
    if (!window.confirm(`${ACTIONS[action].confirm}\n\n${formatPhone(member.phone)}`)) return;
    setError(null);
    setBusy(`${member.id}:${action}`);
    startTransition(async () => {
      const res = await aiMemberAction(member.id, action);
      setBusy(null);
      if (!res.ok) return setError(res.error);
      router.refresh();
    });
  }

  return (
    <div className="bg-cream-warm border-line/50 overflow-hidden rounded-2xl border">
      {error && <p className="border-line/50 border-b px-6 py-3 text-[0.85rem] text-red-600">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-forest/5 text-muted border-line/50 border-b">
            <tr>
              {["Member", "Status", "Free tries", "Pass until", "Joined", ""].map((h) => (
                <th key={h} className="px-6 py-4 text-[0.75rem] font-medium tracking-wider uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-line/30 divide-y">
            {members.map((m) => {
              const [label, tone] = STATUS[m.access];
              return (
                <tr key={m.id} className="hover:bg-forest/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-ink text-[0.92rem] font-medium">{formatPhone(m.phone)}</p>
                    {(m.name || m.email) && (
                      <p className="text-muted mt-0.5 text-[0.78rem]">{[m.name, m.email].filter(Boolean).join(" · ")}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("rounded-full px-2.5 py-1 text-[0.72rem] font-medium", tone)}>{label}</span>
                  </td>
                  <td className="text-muted px-6 py-4 text-[0.85rem]">
                    {m.freeTriesUsed} used · {m.freeTriesLeft} left
                  </td>
                  <td className="text-muted px-6 py-4 text-[0.85rem]">{m.passExpiresAt ? formatDate(m.passExpiresAt) : "—"}</td>
                  <td className="text-muted px-6 py-4 text-[0.85rem]">{m.joinedAt ? formatDate(m.joinedAt) : "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1.5">
                      {applicableActions(m).map((action) => (
                        <button
                          key={action}
                          type="button"
                          disabled={pending}
                          onClick={() => act(m, action)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.75rem] font-medium transition-colors disabled:opacity-50",
                            action === "revoke"
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-forest/25 text-forest hover:bg-forest/5",
                          )}
                        >
                          {busy === `${m.id}:${action}` && <Loader2 className="size-3 animate-spin" />}
                          {ACTIONS[action].label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted px-6 py-12 text-center">
                  No members yet — they appear here the first time they sign in.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
