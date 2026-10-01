import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Mail, Phone, Receipt } from "lucide-react";

import { adminApi } from "@/lib/api";
import { requireSession } from "@/lib/session";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Admin - Customer" };

export default async function AdminCustomerPage({ params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  const { accessToken } = await requireSession();

  let customer;
  try {
    customer = await adminApi.customer(accessToken, decodeURIComponent(email));
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <Link href="/admin/customers" className="text-forest inline-flex items-center gap-1.5 text-[0.85rem] font-medium">
          <ArrowLeft className="size-4" />
          All customers
        </Link>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="bg-cream-warm border border-line/50 rounded-2xl p-6 sm:p-8">
          <h1 className="font-display text-ink text-[1.75rem] font-medium">{customer.name}</h1>
          <div className="text-muted mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[0.88rem]">
            <span className="flex items-center gap-1.5">
              <Mail className="size-4" />
              {customer.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="size-4" />
              {customer.phone}
            </span>
          </div>
          <div className="border-line/50 mt-6 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4">
            <div>
              <p className="text-muted text-[0.75rem] uppercase tracking-wider">Courses</p>
              <p className="text-ink mt-1 text-[1.3rem] font-medium">{customer.orderCount}</p>
            </div>
            <div>
              <p className="text-muted text-[0.75rem] uppercase tracking-wider">Total spent</p>
              <p className="text-ink mt-1 text-[1.3rem] font-medium">{formatPrice(customer.totalSpent)}</p>
            </div>
            <div>
              <p className="text-muted text-[0.75rem] uppercase tracking-wider">Customer since</p>
              <p className="text-ink mt-1 text-[1.3rem] font-medium">
                {customer.firstPurchaseAt ? formatDate(customer.firstPurchaseAt) : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted text-[0.75rem] uppercase tracking-wider">Last purchase</p>
              <p className="text-ink mt-1 text-[1.3rem] font-medium">
                {customer.lastPurchaseAt ? formatDate(customer.lastPurchaseAt) : "—"}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div>
          <h2 className="font-display text-ink mb-4 text-[1.15rem] font-medium">Purchase history</h2>
          <div className="bg-cream-warm border-line/50 divide-line/30 divide-y overflow-hidden rounded-2xl border">
            {customer.orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/billing/${order.id}`}
                className="hover:bg-forest/5 flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition-colors"
              >
                <div>
                  <p className="text-ink font-medium">{order.courseTitle}</p>
                  <p className="text-muted mt-1 flex items-center gap-1.5 text-[0.78rem]">
                    <Receipt className="size-3" />
                    {order.invoiceNumber || "No invoice"} · {order.paidAt ? formatDate(order.paidAt) : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {order.emailSentAt ? (
                    <span className="text-forest flex items-center gap-1.5 text-[0.78rem]">
                      <CheckCircle2 className="size-3.5" />
                      Emailed
                    </span>
                  ) : (
                    <span className="text-[0.78rem] text-red-600">Not emailed</span>
                  )}
                  <span className="text-ink font-medium">{formatPrice(order.amount)}</span>
                </div>
              </Link>
            ))}
            {customer.orders.length === 0 && (
              <p className="text-muted px-6 py-12 text-center text-[0.9rem]">No purchases on record.</p>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
