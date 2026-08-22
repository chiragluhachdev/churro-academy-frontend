import type { Metadata } from "next";

import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { SupportFab } from "@/components/dashboard/SupportFab";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Churro Academy" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream flex min-h-screen flex-col lg:flex-row">
      <DashboardNav />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1200px] px-5 pt-7 pb-28 sm:px-8 lg:px-12 lg:py-12">
          {children}
        </div>
      </div>
      <SupportFab />
    </div>
  );
}
