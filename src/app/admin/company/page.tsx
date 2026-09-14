import { fetchBilling } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { BillingForm } from "@/components/admin/BillingForm";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = { title: "Admin - Company Details" };

export default async function AdminCompanyPage() {
  await requireAdmin();
  const billing = await fetchBilling();

  return (
    <div className="space-y-10">
      <Reveal>
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Company Details</h1>
          <p className="text-muted mt-2 text-[0.95rem]">
            Used on every invoice — company name, GSTIN, address and GST rate.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <BillingForm initialData={billing} />
      </Reveal>
    </div>
  );
}
