import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { SupportFab } from "@/components/dashboard/SupportFab";
import { dashboardPath, requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Churro Academy" },
};

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { user } = await requireSession(`/${username}/dashboard`);

  // The URL carries a username, so make sure it is actually theirs — otherwise
  // /someone-else/dashboard would be a way to peek at another account.
  if (user.username !== username.toLowerCase()) {
    if (username.toLowerCase() === "dashboard") notFound();
    redirect(dashboardPath(user.username));
  }

  return (
    <div className="bg-cream flex min-h-screen flex-col lg:flex-row">
      <DashboardNav
        username={user.username}
        name={user.name}
        email={user.email}
        avatar={user.image ?? undefined}
        signOut={<SignOutButton />}
      />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1200px] px-5 pt-7 pb-28 sm:px-8 lg:px-12 lg:py-12">
          {children}
        </div>
      </div>
      <SupportFab />
    </div>
  );
}
