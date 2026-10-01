import Link from "next/link";
import { BookOpen, Phone, Search } from "lucide-react";

import { adminApi } from "@/lib/api";
import { requireSession } from "@/lib/session";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Admin - Customers" };

/**
 * Every student, rolled up by email across all the courses they've bought.
 * There's no account system — this is purely a read of the order history,
 * grouped by buyer, so the admin has one place to see "who is this person
 * and what have they purchased" instead of scanning the raw order list.
 */
export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const { accessToken } = await requireSession();
  const { q } = (await searchParams) ?? {};
  const customers = await adminApi.customers(accessToken, { q });
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight">Customers</h1>
            <p className="text-muted mt-2 text-[0.95rem]">
              Everyone who has bought a course — their contact details and what they&rsquo;ve purchased.
            </p>
          </div>
          {customers.length > 0 && (
            <p className="text-muted text-[0.85rem]">
              {customers.length} student{customers.length === 1 ? "" : "s"} · {formatPrice(totalRevenue)} total
            </p>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <form action="/admin/customers" method="get" className="relative max-w-sm">
          <Search className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name, email, phone…"
            className="border-line/60 bg-cream-warm w-full rounded-full border py-2.5 pr-4 pl-9 text-[0.85rem] outline-none focus:border-forest/40"
          />
        </form>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="bg-cream-warm border border-line/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-forest/5 text-muted border-b border-line/50">
                <tr>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Student</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Contact</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Courses</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Last purchase</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem] text-right">
                    Total spent
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line/30">
                {customers.map((customer) => (
                  <tr key={customer.email} className="hover:bg-forest/5 group relative transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/customers/${encodeURIComponent(customer.email)}`}
                        className="font-medium text-ink text-[0.95rem] group-hover:text-forest after:absolute after:inset-0"
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-muted text-[0.82rem]">{customer.email}</p>
                      <p className="text-muted mt-0.5 flex items-center gap-1 text-[0.78rem]">
                        <Phone className="size-3" />
                        {customer.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-ink text-[0.9rem]">
                        <BookOpen className="size-3.5 text-forest/70" />
                        {customer.orderCount} course{customer.orderCount === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted text-[0.85rem]">
                      {customer.lastPurchaseAt ? formatDate(customer.lastPurchaseAt) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-medium text-ink">{formatPrice(customer.totalSpent)}</span>
                    </td>
                    <td className="pr-5 text-muted">→</td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted">
                      No customers match this view yet.
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
