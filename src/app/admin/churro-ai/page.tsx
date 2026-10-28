import Link from "next/link";
import { CalendarClock, CreditCard, ExternalLink, IndianRupee, Mail, Receipt, Search, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AiMembersTable } from "@/components/admin/AiMembersTable";
import { AiSettingsForm } from "@/components/admin/AiSettingsForm";
import { Reveal } from "@/components/ui/Reveal";
import { adminApi } from "@/lib/api";
import type { AiOverview } from "@/lib/api";
import { passLength } from "@/lib/churroaiShared";
import { cn, formatDate, formatPrice } from "@/lib/format";
import { requireSession } from "@/lib/session";

export const metadata = { title: "Admin - Churro AI" };

const FILTERS = [
  { value: "", label: "All" },
  { value: "pass", label: "Pass active" },
  { value: "trial", label: "On free try" },
  { value: "trial_available", label: "Not started" },
  { value: "locked", label: "Try used, no pass" },
] as const;

const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

function daysLeft(iso: string) {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  return days <= 1 ? "today or tomorrow" : `in ${days} days`;
}

function StatTile({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: string; note: string }) {
  return (
    <div className="border-line/50 bg-cream-warm rounded-2xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted text-[0.8rem] font-medium">{label}</p>
        <span className="bg-forest/10 text-forest rounded-lg p-1.5">
          <Icon className="size-4" strokeWidth={1.7} />
        </span>
      </div>
      <p className="font-display text-ink mt-2 text-[1.8rem] leading-none font-medium tabular-nums">{value}</p>
      <p className="text-muted mt-2 text-[0.78rem]">{note}</p>
    </div>
  );
}

function HealthChip({ ok, icon: Icon, label }: { ok: boolean; icon: LucideIcon; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.75rem] font-medium",
        ok ? "bg-forest/10 text-forest" : "bg-[var(--color-gold)]/20 text-ink",
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.8} />
      {label}
    </span>
  );
}

/** Signed up → tried free → paid. One series, so one hue; every step is labelled. */
function Funnel({ o }: { o: AiOverview }) {
  const steps = [
    { label: "Signed up", value: o.members, note: "" },
    { label: "Started a free try", value: o.triedFree, note: `${percent(o.triedFree, o.members)}% of sign-ups` },
    { label: "Bought a pass", value: o.buyers, note: `${percent(o.buyers, o.triedFree)}% of those who tried` },
  ];
  const max = Math.max(1, o.members);
  return (
    <div className="border-line/50 bg-cream-warm rounded-2xl border p-6">
      <h3 className="text-ink text-[0.95rem] font-medium">From sign-up to paying</h3>
      <p className="text-muted mt-1 text-[0.8rem]">Every member since launch.</p>
      <dl className="mt-5 space-y-4">
        {steps.map((s) => (
          <div key={s.label}>
            <div className="flex items-baseline justify-between gap-3 text-[0.85rem]">
              <dt className="text-ink">{s.label}</dt>
              <dd className="text-ink font-medium tabular-nums">
                {s.value}
                {s.note && <span className="text-muted ml-2 text-[0.75rem] font-normal">{s.note}</span>}
              </dd>
            </div>
            <div className="bg-forest/8 mt-1.5 h-2.5 overflow-hidden rounded-full">
              <div
                className="bg-forest h-full rounded-full"
                style={{ width: `${s.value === 0 ? 0 : Math.max(2, (s.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

function RecentSales({ sales }: { sales: AiOverview["recentSales"] }) {
  return (
    <div className="border-line/50 bg-cream-warm rounded-2xl border p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-ink text-[0.95rem] font-medium">Latest pass sales</h3>
        <Link href="/admin/billing" className="text-forest text-[0.8rem] font-medium hover:underline">
          All in Billing
        </Link>
      </div>
      {sales.length === 0 ? (
        <p className="text-muted mt-5 text-[0.85rem]">No passes sold yet.</p>
      ) : (
        <ul className="divide-line/40 mt-3 divide-y">
          {sales.map((s) => (
            <li key={s.id}>
              <Link href={`/admin/billing/${s.id}`} className="hover:bg-forest/5 -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5">
                <span className="min-w-0">
                  <span className="text-ink block truncate text-[0.88rem]">{s.name || s.email}</span>
                  <span className="text-muted block truncate text-[0.75rem]">
                    {[s.email, s.paidAt ? formatDate(s.paidAt) : ""].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="text-ink shrink-0 text-[0.88rem] font-medium tabular-nums">{formatPrice(s.amount)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Expiring({ members }: { members: AiOverview["expiring"] }) {
  return (
    <div className="border-line/50 bg-cream-warm rounded-2xl border p-6">
      <h3 className="text-ink text-[0.95rem] font-medium">Passes ending soon</h3>
      <p className="text-muted mt-1 text-[0.8rem]">Next 14 days: a good moment for a renewal reminder.</p>
      {members.length === 0 ? (
        <p className="text-muted mt-5 text-[0.85rem]">None in the next two weeks.</p>
      ) : (
        <ul className="divide-line/40 mt-3 divide-y">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-ink min-w-0 truncate text-[0.88rem]">{m.email || m.name}</span>
              <span className="text-muted shrink-0 text-[0.78rem]">{daysLeft(m.passExpiresAt!)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function AdminChurroAiPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const { accessToken } = await requireSession();
  const { q, status = "" } = (await searchParams) ?? {};
  const [settings, overview, { members }] = await Promise.all([
    adminApi.aiSettings(accessToken),
    adminApi.aiOverview(accessToken),
    adminApi.aiMembers(accessToken, { q, status }),
  ]);
  const o = overview;

  const filterHref = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    if (q) params.set("q", q);
    return `/admin/churro-ai${params.size ? `?${params}` : ""}`;
  };

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl font-medium tracking-tight">Churro AI</h1>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-wide uppercase",
                  o.calculatorEnabled ? "bg-forest text-cream" : "bg-line/60 text-muted",
                )}
              >
                {o.calculatorEnabled ? "Live" : "Switched off"}
              </span>
            </div>
            <p className="text-muted mt-2 text-[0.95rem]">
              {formatPrice(settings.passPrice)} / {passLength(settings.passDays)} · one {settings.trialMinutes}-minute free try
              per email. Members sign in by email.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <HealthChip
                ok={o.providers.email === "brevo"}
                icon={Mail}
                label={o.providers.email === "brevo" ? "Sign-in emails: sending via Brevo" : "Sign-in emails: not connected"}
              />
              <HealthChip
                ok={o.providers.payments === "razorpay"}
                icon={CreditCard}
                label={o.providers.payments === "razorpay" ? "Payments: Razorpay live" : "Payments: test mode"}
              />
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-forest inline-flex items-center gap-1.5 text-[0.85rem] font-medium hover:underline"
          >
            Open Churro AI
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile icon={Users} label="Members" value={String(o.members)} note={`+${o.newThisWeek} in the last 7 days`} />
          <StatTile
            icon={CalendarClock}
            label="Active passes"
            value={String(o.activePasses)}
            note={`${o.autoRenewing} auto-renewing · ${o.onTrial} on a free try`}
          />
          <StatTile
            icon={TrendingUp}
            label="Try → pass"
            value={`${percent(o.buyers, o.triedFree)}%`}
            note={`${o.buyers} of ${o.triedFree} who tried went on to pay`}
          />
          <StatTile
            icon={IndianRupee}
            label="Pass revenue"
            value={formatPrice(o.revenue)}
            note={`${formatPrice(o.revenueThisMonth)} this month · ${o.passesSold} sold`}
          />
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="grid gap-4 lg:grid-cols-3">
          <Funnel o={o} />
          <RecentSales sales={o.recentSales} />
          <Expiring members={o.expiring} />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-ink flex items-center gap-2 text-[1.3rem] font-medium">
              <Receipt className="text-forest size-5" strokeWidth={1.6} />
              Members
            </h2>
            <form action="/admin/churro-ai" method="get" className="relative">
              {status && <input type="hidden" name="status" value={status} />}
              <Search className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search email or name…"
                className="border-line/60 bg-cream-warm focus:border-forest/40 w-64 rounded-full border py-2.5 pr-4 pl-9 text-[0.85rem] outline-none"
              />
            </form>
          </div>
          <nav aria-label="Filter members" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Link
                key={f.value}
                href={filterHref(f.value)}
                aria-current={status === f.value ? "page" : undefined}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors",
                  status === f.value
                    ? "bg-forest text-cream border-forest"
                    : "border-line/70 text-ink/70 hover:border-forest/40 hover:text-forest",
                )}
              >
                {f.label}
              </Link>
            ))}
          </nav>
          <AiMembersTable
            members={members}
            empty={status || q ? "No members match this filter." : undefined}
          />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="space-y-4">
          <h2 className="font-display text-ink text-[1.3rem] font-medium">Settings</h2>
          <AiSettingsForm initialData={settings} />
        </div>
      </Reveal>
    </div>
  );
}
