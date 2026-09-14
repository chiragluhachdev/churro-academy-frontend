import { ChefForm } from "@/components/admin/ChefForm";
import { Reveal } from "@/components/ui/Reveal";
import { fetchChef } from "@/lib/api";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Admin - Chef Profile" };

export default async function AdminChefPage() {
  await requireAdmin();
  const chef = await fetchChef();

  return (
    <div className="space-y-10">
      <Reveal>
        <h1 className="font-display text-4xl font-medium tracking-tight">Chef profile</h1>
        <p className="text-muted mt-2 text-[0.95rem]">
          Shown on the home page, the Chef and About pages, and every course page.
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <ChefForm initialData={chef} />
      </Reveal>
    </div>
  );
}
