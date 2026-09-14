import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { AdminSidebarNav, AdminTabs } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Churro Academy" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();

  const brand = (
    <Link href="/admin" className="flex items-center gap-3">
      <Image src="/logo-mark.png" alt="" width={512} height={512} className="size-9" />
      <span className="leading-tight">
        <span className="font-display block text-[1.05rem] font-medium">Churro Academy</span>
        <span className="text-cream/55 block text-[0.7rem] tracking-[0.16em] uppercase">Admin</span>
      </span>
    </Link>
  );

  const signOut = (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-cream/80 hover:bg-forest hover:text-cream flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[0.9rem] font-medium transition-colors"
      >
        <LogOut className="size-[1.1rem]" strokeWidth={1.6} />
        Sign out
      </button>
    </form>
  );

  return (
    <div className="bg-cream text-ink min-h-screen">
      {/* Desktop sidebar */}
      <aside className="bg-forest-deep text-cream fixed inset-y-0 left-0 z-20 hidden w-64 flex-col lg:flex">
        <div className="border-cream/10 flex h-20 items-center border-b px-6">{brand}</div>
        <AdminSidebarNav />
        <div className="border-cream/10 space-y-1 border-t p-4">
          <Link
            href="/"
            target="_blank"
            className="text-cream/80 hover:bg-forest hover:text-cream flex items-center gap-3 rounded-xl px-4 py-2.5 text-[0.9rem] font-medium transition-colors"
          >
            <ExternalLink className="size-[1.1rem]" strokeWidth={1.6} />
            View site
          </Link>
          {signOut}
          <p className="text-cream/45 truncate px-4 pt-2 text-[0.72rem]">{user.email}</p>
        </div>
      </aside>

      {/* Phone / tablet header */}
      <header className="bg-forest-deep text-cream sticky top-0 z-20 space-y-4 px-5 pt-4 pb-3 lg:hidden">
        <div className="flex items-center justify-between">
          {brand}
          <div className="flex items-center gap-1">
            <Link href="/" target="_blank" aria-label="View site" className="hover:bg-forest rounded-full p-2.5">
              <ExternalLink className="size-5" strokeWidth={1.6} />
            </Link>
            <form action={logoutAction}>
              <button type="submit" aria-label="Sign out" className="hover:bg-forest rounded-full p-2.5">
                <LogOut className="size-5" strokeWidth={1.6} />
              </button>
            </form>
          </div>
        </div>
        <AdminTabs />
      </header>

      <main className="min-h-screen px-5 py-8 sm:px-8 lg:ml-64 lg:px-14 lg:py-14">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
