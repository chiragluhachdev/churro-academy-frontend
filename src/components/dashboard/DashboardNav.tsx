"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Bell, BookOpen, LayoutGrid, UserRound, Compass } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/format";

interface DashboardNavProps {
  username: string;
  name: string;
  email: string;
  avatar?: string;
  /** Sign-out form, passed in from the server layout. */
  signOut?: ReactNode;
}

function Wordmark({ href }: { href: string }) {
  return (
    <Link href={href} aria-label="Churro Academy — dashboard" className="flex items-center gap-3">
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

export function DashboardNav({ username, name, email, avatar, signOut }: DashboardNavProps) {
  const pathname = usePathname();
  const base = `/${username}/dashboard`;

  const links: { label: string; href: string; icon: LucideIcon }[] = [
    { label: "Overview", href: base, icon: LayoutGrid },
    { label: "My Courses", href: `${base}/courses`, icon: BookOpen },
    { label: "Certificates", href: `${base}/certificates`, icon: Award },
    { label: "Explore", href: `${base}/explore`, icon: Compass },
    { label: "Profile", href: `${base}/profile`, icon: UserRound },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header className="border-line/70 bg-cream sticky top-0 z-40 flex items-center justify-between border-b px-5 py-3.5 lg:hidden">
        <Wordmark href={base} />
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
              <Icon className="size-[1.35rem]" strokeWidth={active ? 2 : 1.6} aria-hidden="true" />
              <span className={cn("text-[0.68rem] leading-none", active ? "font-semibold" : "font-medium")}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <aside className="border-line/70 bg-cream-warm/60 sticky top-0 hidden h-screen w-[17rem] shrink-0 flex-col border-r px-6 py-8 lg:flex">
        <Wordmark href={base} />

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
            {avatar ? (
              <Image src={avatar} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
            ) : (
              <span className="bg-forest text-cream font-display flex size-10 shrink-0 items-center justify-center rounded-full text-[0.95rem] font-semibold">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="min-w-0">
              <span className="text-ink block truncate text-[0.85rem] font-semibold">{name}</span>
              <span className="text-muted block truncate text-[0.75rem]">{email}</span>
            </span>
          </div>
          <div className="mt-4">{signOut}</div>
        </div>
      </aside>
    </>
  );
}
