import Link from "next/link";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";

import { signOutAction } from "@/app/actions/churroai";
import { Brand } from "@/components/churroai/Brand";
import { formatPhone, type AiMember } from "@/lib/churroaiShared";
import { cn, formatDate } from "@/lib/format";

function StatusPill({ member }: { member: AiMember }) {
  const [label, tone] =
    member.access === "pass"
      ? member.autoRenew
        ? [`Auto-renews ${formatDate(member.nextChargeAt ?? member.passExpiresAt!)}`, "bg-forest/10 text-forest"]
        : [`Pass active · till ${formatDate(member.passExpiresAt!)}`, "bg-forest/10 text-forest"]
      : member.access === "trial"
        ? ["Free try running", "bg-[var(--color-gold)]/20 text-ink"]
        : member.access === "trial_available"
          ? ["Free try available", "bg-pill text-ink"]
          : ["Free try used", "bg-line/60 text-muted"];
  return <span className={cn("rounded-full px-3 py-1 text-[0.72rem] font-medium", tone)}>{label}</span>;
}

/** Header + page frame for the signed-in Churro AI screens. */
export function AppShell({
  member,
  adminPreview,
  children,
}: {
  member: AiMember | null;
  adminPreview?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="bg-cream min-h-screen">
      <header className="border-line/60 bg-cream/85 sticky top-0 z-40 border-b backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link href="/" aria-label="Churro AI home">
            <Brand />
          </Link>
          <div className="flex items-center gap-3">
            {adminPreview && (
              <span className="bg-forest text-cream rounded-full px-3 py-1 text-[0.72rem] font-medium">Admin preview</span>
            )}
            {member && (
              <>
                <span className="hidden sm:inline">
                  <StatusPill member={member} />
                </span>
                <span className="text-ink/70 hidden max-w-[16rem] truncate text-[0.85rem] md:inline">
                  {member.email || formatPhone(member.phone)}
                </span>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="text-ink/70 hover:text-forest hover:bg-forest/5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.82rem] transition-colors"
                  >
                    <LogOut className="size-3.5" />
                    Sign out
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
