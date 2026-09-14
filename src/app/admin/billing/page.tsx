import Link from "next/link";
import { CreditCard, Mail, Phone, Receipt, Search } from "lucide-react";

import { adminApi, type OrderStatus } from "@/lib/api";
import { requireSession } from "@/lib/session";
import { Reveal } from "@/components/ui/Reveal";
import { cn, formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Admin - Billing" };

const TABS: { label: string; value: OrderStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "created" },
  { label: "Failed", value: "failed" },
  { label: "Expired", value: "expired" },
];

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-forest/10 text-forest",
  created: "bg-[var(--color-gold)]/20 text-ink",
  failed: "bg-red-50 text-red-600",
  expired: "bg-line/60 text-muted",
};

/**
 * The audit screen: every order ever created, who placed it, how much they
 * paid (with the GST already broken out), and its status. This is the single
 * source of truth for "who bought what and how much" now that there's no
 * student dashboard to read it back from.
 */
export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; q?: string }>;
}) {
  const { accessToken } = await requireSession();
  const { status: rawStatus, q } = (await searchParams) ?? {};
  const status = (["created", "paid", "failed", "expired"] as const).includes(rawStatus as OrderStatus)
    ? (rawStatus as OrderStatus)
    : undefined;

  const orders = await adminApi.orders(accessToken, { status, q });
  const totalPaid = orders.filter((o) => o.status === "paid").reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight">Billing</h1>
            <p className="text-muted mt-2 text-[0.95rem]">
              Every order — who paid, how much, and the invoice behind it.
            </p>
          </div>
          {orders.length > 0 && (
            <p className="text-muted text-[0.85rem]">
              {orders.length} order{orders.length === 1 ? "" : "s"} shown · {formatPrice(totalPaid)} paid
            </p>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const active = (status ?? "") === tab.value;
              const href = tab.value ? `/admin/billing?status=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ""}` : `/admin/billing${q ? `?q=${encodeURIComponent(q)}` : ""}`;
              return (
                <Link
                  key={tab.label}
                  href={href}
                  className={cn(
                    "rounded-full px-4 py-2 text-[0.85rem] font-medium transition-colors",
                    active ? "bg-forest text-cream" : "bg-cream-warm text-muted hover:text-ink border border-line/50",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
          <form action="/admin/billing" method="get" className="relative">
            {status && <input type="hidden" name="status" value={status} />}
            <Search className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search name, email, phone, invoice…"
              className="border-line/60 bg-cream-warm w-64 rounded-full border py-2.5 pr-4 pl-9 text-[0.85rem] outline-none focus:border-forest/40"
            />
          </form>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="bg-cream-warm border border-line/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-forest/5 text-muted border-b border-line/50">
                <tr>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Buyer</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Course</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Date</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Status</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem] text-right">Amount</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line/30">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-forest/5 group relative transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/billing/${order.id}`}
                        className="font-medium text-ink text-[0.95rem] group-hover:text-forest after:absolute after:inset-0"
                      >
                        {order.buyerName}
                      </Link>
                      <p className="text-muted mt-0.5 text-[0.8rem]">{order.buyerEmail}</p>
                      <p className="text-muted mt-0.5 flex items-center gap-1 text-[0.78rem]">
                        <Phone className="size-3" />
                        {order.buyerPhone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-ink text-[0.9rem]">
                        <CreditCard className="size-3.5 text-forest/70" />
                        {order.courseTitle}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted text-[0.85rem]">
                      {order.paidAt ? formatDate(order.paidAt) : order.createdAt ? formatDate(order.createdAt) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("rounded-full px-2.5 py-1 text-[0.72rem] font-medium capitalize", STATUS_STYLE[order.status] ?? "bg-line/60 text-muted")}>
                        {order.status}
                      </span>
                      {order.invoiceNumber && (
                        <span className="text-muted mt-1 flex items-center gap-1 text-[0.72rem]">
                          <Receipt className="size-3" />
                          {order.invoiceNumber}
                        </span>
                      )}
                      {order.status === "paid" && (
                        <span className={cn("mt-1 flex items-center gap-1 text-[0.72rem]", order.emailSentAt ? "text-forest" : "text-red-600")}>
                          <Mail className="size-3" />
                          {order.emailSentAt ? "Emailed" : "Not emailed"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-medium text-ink">{formatPrice(order.amount)}</span>
                      <p className="text-muted text-[0.72rem]">incl. {formatPrice(order.gst.gstAmount)} GST</p>
                    </td>
                    <td className="pr-5 text-muted">→</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted">
                      No orders match this view yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
