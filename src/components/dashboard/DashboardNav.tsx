"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Bell, BookOpen, LayoutGrid, LogOut, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/format";
import { student } from "@/data/student";

const links: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { label: "Certificates", href: "/dashboard/certificates", icon: Award },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
];

function Wordmark() {
  return (
    <Link href="/" aria-label="Churro Academy — home" className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt=""
        width={512}
        height={512}
        className="size-10 rounded-full object-cover"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-forest text-[1.15rem] leading-none font-semibold tracking-[0.08em]">
          CHURRO
        </span>
        <span className="text-forest mt-1 text-[0.55rem] leading-none font-medium tracking-[0.26em]">
          ACADEMY
        </span>
      </span>
    </Link>
  );
}

export function DashboardNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Phone: app-style top bar. Navigation lives in the bottom tab bar, so
          there is no drawer to open here. */}
      <header className="border-line/70 bg-cream sticky top-0 z-40 flex items-center justify-between border-b px-5 py-3.5 lg:hidden">
        <Wordmark />
        <button
          type="button"
          aria-label="Notifications"
          className="text-forest hover:bg-forest/8 relative inline-flex size-10 items-center justify-center rounded-full transition-colors"
        >
          <Bell className="size-[1.35rem]" strokeWidth={1.6} />
          <span
            aria-hidden="true"
            className="bg-forest border-cream absolute top-1.5 right-1.5 size-2.5 rounded-full border-2"
          />
        </button>
      </header>

      {/* Phone: fixed bottom tabs. */}
      <nav
        aria-label="Dashboard"
        className="border-line/70 bg-cream/95 fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        {links.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1.5 px-1 py-2.5 transition-colors",
                active ? "text-forest" : "text-muted",
              )}
            >
              <Icon
                className="size-[1.35rem]"
                strokeWidth={active ? 2 : 1.6}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-[0.68rem] leading-none",
                  active ? "font-semibold" : "font-medium",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop sidebar. */}
      <aside className="border-line/70 bg-cream-warm/60 sticky top-0 hidden h-screen w-[17rem] shrink-0 flex-col border-r px-6 py-8 lg:flex">
        <Wordmark />

        <nav aria-label="Dashboard" className="mt-9 flex flex-1 flex-col gap-1">
          {links.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-[0.9rem] transition-colors duration-200",
                  active
                    ? "bg-forest text-cream font-medium"
                    : "text-ink/75 hover:bg-forest/8 hover:text-forest",
                )}
              >
                <Icon className="size-[1.05rem]" strokeWidth={1.6} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-line/70 mt-6 border-t pt-5">
          <div className="flex items-center gap-3">
            <Image
              src={student.avatar}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
            <span className="min-w-0">
              <span className="text-ink block truncate text-[0.85rem] font-semibold">
                {student.name}
              </span>
              <span className="text-muted block truncate text-[0.75rem]">
                {student.email}
              </span>
            </span>
          </div>
          <Link
            href="/login"
            className="text-muted hover:text-forest mt-4 flex items-center gap-3 rounded-xl px-4 py-2.5 text-[0.85rem] transition-colors"
          >
            <LogOut className="size-4" strokeWidth={1.6} aria-hidden="true" />
            Sign out
          </Link>
        </div>
      </aside>
    </>
  );
}
