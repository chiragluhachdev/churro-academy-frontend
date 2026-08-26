import type { Metadata } from "next";
import Image from "next/image";
import { Bell, ChevronRight, CreditCard, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { fetchMyEnrollments, studentStats } from "@/lib/api";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Profile" };

const settings: { icon: LucideIcon; label: string; description: string }[] = [
  { icon: ShieldCheck, label: "Password & security", description: "Change your password and manage sessions" },
  { icon: CreditCard, label: "Billing & purchases", description: "Invoices and payment methods" },
  { icon: Bell, label: "Email preferences", description: "Course updates, new releases and offers" },
];

export default async function ProfilePage() {
  const { user: sessionUser, accessToken } = await requireSession();
  const stats = studentStats(await fetchMyEnrollments(accessToken));

  return (
    <div className="space-y-12">
      <Reveal>
        <DashboardHeader
          eyebrow="Profile"
          title="Your account."
          lede="Your details, your progress and everything you can change."
        />
      </Reveal>

      <Reveal delay={0.05}>
        <div className="border-line/80 bg-cream-warm/50 flex flex-col gap-6 rounded-2xl border p-7 sm:flex-row sm:items-center">
          {sessionUser.image ? (
            <Image
              src={sessionUser.image}
              alt=""
              width={88}
              height={88}
              className="size-22 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="bg-forest text-cream font-display flex size-22 shrink-0 items-center justify-center rounded-full text-[2rem] font-medium">
              {sessionUser.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display text-ink text-[1.5rem] font-medium">{sessionUser.name}</p>
            <p className="text-muted mt-1 text-[0.88rem]">{sessionUser.email}</p>
            <p className="text-muted mt-2 text-[0.78rem]">
              @{sessionUser.username}
              {sessionUser.role === "admin" && (
                <span className="bg-sand text-forest ml-3 rounded-full px-2.5 py-1 text-[0.7rem] font-medium">
                  Admin
                </span>
              )}
            </p>
          </div>
          <dl className="text-muted grid shrink-0 grid-cols-3 gap-6 text-center text-[0.75rem] sm:gap-8">
            {[
              { value: stats.coursesEnrolled, label: "Courses" },
              { value: stats.lessonsDone, label: "Lessons" },
              { value: stats.certificates, label: "Certificates" },
            ].map(({ value, label }) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-ink text-[1.35rem] leading-none font-medium">
                  {value}
                </dd>
                <p className="mt-1.5">{label}</p>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Eyebrow>Personal details</Eyebrow>
        <div className="mt-5">
          <ProfileForm
            initialName={sessionUser.name}
            initialUsername={sessionUser.username}
            email={sessionUser.email}
          />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <Eyebrow>Settings</Eyebrow>
        <ul className="border-line/70 mt-5 grid gap-px overflow-hidden rounded-2xl border">
          {settings.map(({ icon: Icon, label, description }) => (
            <li key={label} className="bg-cream-warm/50">
              <button
                type="button"
                disabled
                title="Not built yet"
                className="flex w-full items-center gap-4 px-6 py-5 text-left disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-forest flex size-9 shrink-0 items-center justify-center">
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-ink block text-[0.92rem] font-medium">{label}</span>
                  <span className="text-muted mt-0.5 block text-[0.8rem]">{description}</span>
                </span>
                <ChevronRight className="text-muted size-4 shrink-0" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="border-line inline-flex rounded-full border">
          <SignOutButton className="px-6 py-3" />
        </div>
      </Reveal>
    </div>
  );
}
