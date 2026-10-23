import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";

import { AiMembersTable } from "@/components/admin/AiMembersTable";
import { AiSettingsForm } from "@/components/admin/AiSettingsForm";
import { Reveal } from "@/components/ui/Reveal";
import { adminApi } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { requireSession } from "@/lib/session";

export const metadata = { title: "Admin - Churro AI" };

export default async function AdminChurroAiPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const { accessToken } = await requireSession();
  const { q } = (await searchParams) ?? {};
  const [settings, { summary, members }] = await Promise.all([
    adminApi.aiSettings(accessToken),
    adminApi.aiMembers(accessToken, { q }),
  ]);

  const stats = [
    { label: "Members", value: String(summary.members) },
    { label: "Active passes", value: String(summary.activePasses) },
    { label: "On a free try now", value: String(summary.onTrial) },
    { label: "Pass revenue", value: formatPrice(summary.revenue) },
  ];

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight">Churro AI</h1>
            <p className="text-muted mt-2 text-[0.95rem]">
              Members sign in with their phone, get a free try, then buy the pass. Pass sales also appear in Billing.
            </p>
          </div>
          <Link
            href="/churroai"
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
          {stats.map((s) => (
            <div key={s.label} className="border-line/50 bg-cream-warm rounded-2xl border p-5">
              <p className="text-muted text-[0.78rem]">{s.label}</p>
              <p className="font-display text-ink mt-1 text-[1.6rem] font-medium">{s.value}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-ink text-[1.3rem] font-medium">Members</h2>
            <form action="/admin/churro-ai" method="get" className="relative">
              <Search className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search phone, name, email…"
                className="border-line/60 bg-cream-warm focus:border-forest/40 w-64 rounded-full border py-2.5 pr-4 pl-9 text-[0.85rem] outline-none"
              />
            </form>
          </div>
          <AiMembersTable members={members} />
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
