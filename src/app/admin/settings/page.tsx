import { fetchSiteSettings } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = { title: "Admin - Settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const site = await fetchSiteSettings();

  return (
    <div className="space-y-10">
      <Reveal>
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Settings</h1>
          <p className="text-muted mt-2 text-[0.95rem]">Site-wide switches — currently just the maintenance lockout.</p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <SiteSettingsForm initialData={site} />
      </Reveal>
    </div>
  );
}
