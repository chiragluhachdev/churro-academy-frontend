import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, Mail } from "lucide-react";

import { adminApi } from "@/lib/api";
import { requireSession } from "@/lib/session";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { PrintButton } from "@/components/invoice/PrintButton";
import { ResendEmailButton } from "@/components/admin/ResendEmailButton";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Admin - Invoice" };

export default async function AdminInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { accessToken } = await requireSession();

  let order;
  try {
    order = await adminApi.order(accessToken, id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link href="/admin/billing" className="text-forest inline-flex items-center gap-1.5 text-[0.85rem] font-medium">
            <ArrowLeft className="size-4" />
            All orders
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-muted text-[0.8rem]">
              {order.provider === "dummy" ? "Dummy payment" : "Razorpay"}
              {order.providerPaymentId && ` · ${order.providerPaymentId}`}
            </span>
            <PrintButton />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <InvoiceDocument
          data={{
            invoiceNumber: order.invoiceNumber,
            status: order.status,
            date: order.paidAt ?? order.createdAt,
            testMode: order.provider === "dummy",
            currency: order.currency,
            courseTitle: order.course.title,
            buyer: order.buyer,
            seller: order.seller,
            gst: order.gst,
          }}
        />
      </Reveal>

      {order.status === "paid" && (
        <Reveal delay={0.1}>
          <div className="border-line/60 bg-cream mx-auto max-w-[40rem] rounded-2xl border p-6 print:hidden sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-ink flex items-center gap-2 font-medium">
                  <Mail className="text-forest size-4" />
                  Enrollment email
                </p>
                {order.emailSentAt ? (
                  <p className="text-forest mt-1.5 flex items-center gap-1.5 text-[0.85rem]">
                    <CheckCircle2 className="size-3.5" />
                    Sent {formatDate(order.emailSentAt)}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[0.85rem] text-red-600">Not sent yet.</p>
                )}
                {order.emailError && (
                  <p className="text-muted mt-1 flex items-start gap-1.5 text-[0.78rem]">
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                    Last attempt failed: {order.emailError}
                  </p>
                )}
                <p className="text-muted mt-2 flex items-center gap-1.5 text-[0.78rem]">
                  {order.courseDelivery.driveLink ? (
                    <>
                      <CheckCircle2 className="text-forest size-3.5 shrink-0" />
                      Course has a Drive link
                      {order.courseDelivery.hasPassword && " and password"} set — resending after changing it
                      picks up the update.
                    </>
                  ) : (
                    <>
                      <AlertCircle className="size-3.5 shrink-0 text-red-500" />
                      No Drive link set on this course yet — the buyer got a &ldquo;coming soon&rdquo; note instead.
                    </>
                  )}
                </p>
              </div>
              <ResendEmailButton orderId={order.id} label={order.emailSentAt ? "Resend email" : "Send email"} />
            </div>

            {order.courseDelivery.driveLink && (
              <a
                href={order.courseDelivery.driveLink}
                target="_blank"
                rel="noreferrer"
                className="text-forest border-line/60 mt-5 flex items-center gap-1.5 border-t pt-4 text-[0.82rem] font-medium"
              >
                {order.courseDelivery.driveLink}
                <ExternalLink className="size-3.5 shrink-0" />
              </a>
            )}
          </div>
        </Reveal>
      )}
    </div>
  );
}
