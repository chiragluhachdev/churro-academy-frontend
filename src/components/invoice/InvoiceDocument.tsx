import Image from "next/image";

import { formatDate, formatPrice, formatPricePrecise } from "@/lib/format";

export interface InvoiceData {
  invoiceNumber: string;
  status: "created" | "paid" | "failed" | "expired";
  date?: string;
  testMode: boolean;
  currency: string;
  courseTitle: string;
  buyer: { name: string; email: string; phone: string };
  seller: { companyName: string; gstin: string; address: string; email: string; phone: string };
  gst: {
    totalAmount: number;
    gstRate: number;
    taxableValue: number;
    gstAmount: number;
    cgstAmount: number;
    sgstAmount: number;
  };
}

/**
 * The printable e-bill — used by both the admin's copy (behind sign-in) and
 * the public one a buyer reaches via their order confirmation link.
 */
export function InvoiceDocument({ data }: { data: InvoiceData }) {
  const isPaid = data.status === "paid";

  return (
    <div className="border-line/60 bg-cream mx-auto max-w-[40rem] rounded-2xl border p-8 sm:p-10 print:max-w-none print:rounded-none print:border-none print:p-0">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line/60 pb-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={96} height={96} className="size-11 rounded-full object-cover" />
          <div>
            <p className="font-display text-ink text-[1.2rem] font-medium leading-tight">{data.seller.companyName}</p>
            {data.seller.gstin && <p className="text-muted text-[0.78rem]">GSTIN: {data.seller.gstin}</p>}
            {data.seller.address && <p className="text-muted max-w-[16rem] text-[0.78rem] leading-snug">{data.seller.address}</p>}
            {(data.seller.email || data.seller.phone) && (
              <p className="text-muted text-[0.78rem]">{[data.seller.email, data.seller.phone].filter(Boolean).join(" · ")}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-ink font-display text-[1.35rem] font-medium">Tax Invoice</p>
          {data.invoiceNumber ? (
            <p className="text-muted mt-1 text-[0.85rem]">
              {data.invoiceNumber}
              {data.date && ` · ${formatDate(data.date)}`}
            </p>
          ) : (
            <p className="text-muted mt-1 text-[0.85rem]">Not yet paid</p>
          )}
          <span
            className={
              "mt-2 inline-block rounded-full px-2.5 py-1 text-[0.72rem] font-medium capitalize " +
              (isPaid ? "bg-forest/10 text-forest" : "bg-line/60 text-muted")
            }
          >
            {data.status}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-muted text-[0.72rem] font-medium tracking-wide uppercase">Billed to</p>
          <p className="text-ink mt-1.5 font-medium">{data.buyer.name}</p>
          <p className="text-muted text-[0.85rem]">{data.buyer.email}</p>
          <p className="text-muted text-[0.85rem]">{data.buyer.phone}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-muted text-[0.72rem] font-medium tracking-wide uppercase">Delivery</p>
          <p className="text-muted mt-1.5 text-[0.85rem] leading-relaxed">
            Course recordings and materials are sent to the WhatsApp number above.
          </p>
        </div>
      </div>

      {data.testMode && (
        <p className="bg-[var(--color-gold)]/15 text-ink mt-6 rounded-xl px-3.5 py-2.5 text-[0.78rem]">
          Test mode — this order was not charged with real money.
        </p>
      )}

      <table className="mt-6 w-full text-left text-[0.88rem]">
        <thead>
          <tr className="border-b border-line/60 text-muted text-[0.72rem] font-medium tracking-wide uppercase">
            <th className="py-2.5 font-medium">Description</th>
            <th className="py-2.5 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-line/40">
            <td className="py-3">{data.courseTitle} — course access</td>
            <td className="py-3 text-right">{formatPricePrecise(data.gst.taxableValue)}</td>
          </tr>
          <tr className="border-b border-line/40">
            <td className="py-3">CGST ({(data.gst.gstRate / 2).toFixed(1)}%)</td>
            <td className="py-3 text-right">{formatPricePrecise(data.gst.cgstAmount)}</td>
          </tr>
          <tr className="border-b border-line/60">
            <td className="py-3">SGST ({(data.gst.gstRate / 2).toFixed(1)}%)</td>
            <td className="py-3 text-right">{formatPricePrecise(data.gst.sgstAmount)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="text-ink pt-4 font-semibold">Total ({data.currency})</td>
            <td className="text-ink font-display pt-4 text-right text-[1.3rem] font-semibold">
              {formatPrice(data.gst.totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>

      <p className="text-muted mt-8 border-t border-line/60 pt-5 text-[0.75rem] leading-relaxed">
        This is a system-generated invoice for {data.seller.companyName}
        {data.seller.gstin && ` (GSTIN ${data.seller.gstin})`}. Prices are inclusive of GST. For any billing
        question, reach us at {data.seller.email || data.seller.phone || "the contact above"}.
      </p>
    </div>
  );
}
