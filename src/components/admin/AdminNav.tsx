"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChefHat,
  CreditCard,
  LayoutDashboard,
  MessageSquareQuote,
  Newspaper,
  Users,
} from "lucide-react";

import { cn } from "@/lib/format";

const SECTIONS = [
  {
    heading: "Store",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Enrollments", href: "/admin/enrollments", icon: CreditCard },
      { label: "Students", href: "/admin/users", icon: Users },
    ],
  },
  {
    heading: "Website",
    items: [
      { label: "Reviews", href: "/admin/testimonials", icon: MessageSquareQuote },
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "Chef profile", href: "/admin/chef", icon: ChefHat },
    ],
  },
];

const ALL = SECTIONS.flatMap((s) => s.items);

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/** Vertical nav for the desktop sidebar. */
export function AdminSidebarNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex-1 space-y-7 overflow-y-auto px-4 py-7">
      {SECTIONS.map((section) => (
        <div key={section.heading}>
          <p className="text-cream/40 mb-2 px-4 text-[0.68rem] font-medium tracking-[0.18em] uppercase">
            {section.heading}
          </p>
          <div className="space-y-1">
            {section.items.map(({ label, href, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-[0.92rem] font-medium transition-colors",
                    active ? "bg-cream text-forest-deep" : "text-cream/80 hover:bg-forest hover:text-cream",
                  )}
                >
                  <Icon className="size-[1.1rem]" strokeWidth={1.6} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

/** Horizontally scrolling tabs for phones and tablets. */
export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
      {ALL.map(({ label, href, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.82rem] font-medium transition-colors",
              active ? "bg-cream text-forest-deep" : "bg-forest text-cream/85",
            )}
          >
            <Icon className="size-4" strokeWidth={1.6} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
