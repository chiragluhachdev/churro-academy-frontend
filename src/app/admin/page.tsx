import { Users, BookOpen, CreditCard, DollarSign } from "lucide-react";
import { adminApi } from "@/lib/api";
import { requireSession } from "@/lib/session";
import { Reveal } from "@/components/ui/Reveal";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const { accessToken } = await requireSession();
  const stats = await adminApi.stats(accessToken);

  const statCards = [
    { label: "Total Revenue", value: formatPrice(stats.revenue), icon: DollarSign },
    { label: "Total Students", value: stats.users.toString(), icon: Users },
    { label: "Active Courses", value: stats.courses.toString(), icon: BookOpen },
    { label: "Enrollments", value: stats.enrollments.toString(), icon: CreditCard },
  ];

  return (
    <div className="space-y-10">
      <Reveal>
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Overview</h1>
          <p className="text-muted mt-2 text-[0.95rem]">
            High-level metrics across Churro Academy.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <div key={stat.label} className="bg-cream-warm border border-line/50 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="bg-forest/10 p-3 rounded-xl">
                  <stat.icon className="size-6 text-forest" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-muted text-[0.85rem] font-medium">{stat.label}</p>
                  <p className="font-display text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
