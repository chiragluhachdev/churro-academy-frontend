import { notFound } from "next/navigation";

import { fetchOrder } from "@/lib/api";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { PrintButton } from "@/components/invoice/PrintButton";
import { Logo } from "@/components/brand/Logo";

export const metadata = { title: "Invoice", robots: { index: false, follow: false } };

/**
 * Reached from the checkout success screen (and safe to bookmark or share):
 * the order id is an unguessable Mongo ObjectId that only the buyer's own
 * browser ever saw, so no sign-in is required to view or print this one order.
 */
export default async function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await fetchOrder(id);
  if (!order) notFound();

  return (
    <div className="bg-cream min-h-screen px-5 py-10 sm:px-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-[40rem] space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <Logo />
          <PrintButton />
        </div>

        <InvoiceDocument
          data={{
            invoiceNumber: order.invoiceNumber,
            status: order.status,
            date: order.paidAt ?? order.expiresAt,
            testMode: order.testMode,
            currency: order.currency,
            courseTitle: order.course.title,
            buyer: order.buyer,
            seller: order.seller,
            gst: order.gst,
          }}
        />
      </div>
    </div>
  );
}
