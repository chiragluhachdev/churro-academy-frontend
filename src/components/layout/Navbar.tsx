"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, LayoutDashboard, LogOut, Menu, User as UserIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { primaryNav } from "@/data/site";
import { cn } from "@/lib/format";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const signedIn = Boolean(session?.user);
  const home = signedIn
    ? session!.user.role === "admin"
      ? "/admin"
      : `/${session!.user.username}/dashboard`
    : "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [accountOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The mobile sheet covers the page, so stop the page behind it scrolling.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-[var(--ease-editorial)]",
        scrolled
          ? "bg-cream/85 shadow-[0_1px_0_0_rgba(41,75,50,0.08)] backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className={cn(
          "mx-auto flex max-w-[1720px] items-center justify-between gap-6 px-5 transition-[padding] duration-500 ease-[var(--ease-editorial)] sm:px-8 lg:px-10",
          scrolled ? "py-3" : "py-5",
        )}
      >
        <Logo href={home} className="shrink-0" />

        <ul className="hidden items-center gap-8 lg:flex">
          {primaryNav.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className="group text-ink/80 hover:text-forest relative py-1 text-[0.9rem] transition-colors"
                >
                  {link.label}
                  <span
                    className={cn(
                      "bg-forest absolute -bottom-0.5 left-0 h-px transition-[width] duration-300 ease-[var(--ease-editorial)]",
                      active ? "w-full" : "w-0 group-hover:w-full",
                    )}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-6 lg:flex">
          {signedIn ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                className="border-forest/20 text-ink hover:bg-forest/5 flex items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5 text-[0.88rem] transition-colors"
              >
                <span className="bg-forest text-cream flex size-7 items-center justify-center rounded-full text-[0.78rem] font-medium">
                  {session!.user.name?.[0]?.toUpperCase() ?? <UserIcon className="size-3.5" />}
                </span>
                {session!.user.name?.split(" ")[0]}
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="border-line/60 bg-cream absolute top-full right-0 mt-2 w-52 overflow-hidden rounded-xl border shadow-lg"
                  >
                    <Link
                      href={home}
                      onClick={() => setAccountOpen(false)}
                      className="text-ink hover:bg-forest/5 flex items-center gap-2.5 px-4 py-3 text-[0.88rem]"
                    >
                      <LayoutDashboard className="size-4" />
                      {session!.user.role === "admin" ? "Admin dashboard" : "My dashboard"}
                    </Link>
                    <form action={logoutAction} className="border-line/50 border-t">
                      <button
                        type="submit"
                        className="text-ink hover:bg-forest/5 flex w-full items-center gap-2.5 px-4 py-3 text-left text-[0.88rem]"
                      >
                        <LogOut className="size-4" />
                        Sign out
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-ink/80 hover:text-forest text-[0.9rem] transition-colors"
            >
              Log in
            </Link>
          )}
          <ButtonLink href="/courses" size="sm">
            Explore
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="border-forest/20 text-forest hover:bg-forest/5 inline-flex size-11 items-center justify-center rounded-full border transition-colors lg:hidden"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="bg-cream border-line/70 border-t lg:hidden"
          >
            <ul className="flex flex-col px-5 py-2 sm:px-8">
              {primaryNav.map((link) => (
                <li key={link.href} className="border-line/60 border-b last:border-0">
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-display text-ink hover:text-forest block py-4 text-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 px-5 pt-2 pb-7 sm:px-8">
              <ButtonLink
                href="/courses"
                className="flex-1"
                onClick={() => setMenuOpen(false)}
              >
                Explore
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink
                href={signedIn ? home : "/login"}
                variant="outline"
                onClick={() => setMenuOpen(false)}
              >
                {signedIn ? "Dashboard" : "Log in"}
              </ButtonLink>
            </div>
            {signedIn && (
              <form action={logoutAction} className="border-line/60 border-t px-5 pb-6 sm:px-8">
                <button
                  type="submit"
                  className="text-muted hover:text-ink mt-4 flex items-center gap-2 text-[0.95rem]"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
