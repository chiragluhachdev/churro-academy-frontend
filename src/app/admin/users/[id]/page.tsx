import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Mail,
  Receipt,
  ShieldCheck,
  User as UserIcon,
  Wallet,
} from "lucide-react";

import { fetchAdminStudent } from "@/lib/api";
import { formatDate, formatPrice, cn } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = { title: "Admin - Student" };

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-forest/10 text-forest",
  created: "bg-gold/20 text-ink",
  failed: "bg-red-50 text-red-600",
  expired: "bg-line/60 text-muted",
};

export default async function AdminStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { accessToken } = await requireSession();
  const detail = await fetchAdminStudent(accessToken, id);
  if (!detail) notFound();

  const { user, summary, enrollments, orders } = detail;

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-sand flex size-14 shrink-0 items-center justify-center rounded-full">
              <UserIcon className="text-forest size-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-ink text-[1.9rem] font-medium tracking-tight">{user.name}</h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-medium",
                    user.role === "admin" ? "bg-forest text-cream" : "bg-forest/10 text-forest",
                  )}
                >
                  {user.role === "admin" && <ShieldCheck className="size-3" />}
                  {user.role}
                </span>
              </div>
              <div className="text-muted mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.85rem]">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {user.email}
                </span>
                <span>@{user.username}</span>
                {user.createdAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Joined {formatDate(user.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link href="/admin/users" className="text-forest text-[0.85rem] font-medium hover:underline">
            ← All users
          </Link>
        </div>
      </Reveal>

      {user.role === "admin" ? (
        <Reveal delay={0.05}>
          <div className="border-line/50 bg-cream-warm rounded-2xl border p-6 text-[0.9rem]">
            <p className="text-ink font-medium">Admin account</p>
            <p className="text-muted mt-1">
              Admins can&apos;t buy courses, so there&apos;s no enrollment or payment history to show here.
            </p>
          </div>
        </Reveal>
      ) : (
        <>
          <Reveal delay={0.05}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Courses owned" value={String(summary.coursesOwned)} icon={BookOpen} />
              <Stat label="Completed" value={String(summary.coursesCompleted)} icon={BadgeCheck} />
              <Stat label="Lessons done" value={String(summary.lessonsCompleted)} icon={CheckCircle2} />
              <Stat label="Total spent" value={formatPrice(summary.totalSpent)} icon={Wallet} />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <section className="space-y-4">
              <h2 className="font-display text-ink text-[1.3rem] font-medium">Courses & progress</h2>
              {enrollments.length === 0 ? (
                <p className="text-muted text-[0.9rem]">Not enrolled in anything yet.</p>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <details
                      key={enrollment.id}
                      className="border-line/50 bg-cream-warm group overflow-hidden rounded-2xl border"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                        <div className="min-w-0">
                          <p className="text-ink truncate font-medium">{enrollment.course.title}</p>
                          <p className="text-muted mt-0.5 text-[0.8rem]">
                            {enrollment.completedLessons}/{enrollment.course.lessons} lessons ·{" "}
                            {enrollment.progress}% {enrollment.isComplete && "· Completed"}
                            {enrollment.purchasedAt && ` · Bought ${formatDate(enrollment.purchasedAt)}`}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <div className="bg-line/60 hidden h-1.5 w-28 overflow-hidden rounded-full sm:block">
                            <div className="bg-forest h-full rounded-full" style={{ width: `${enrollment.progress}%` }} />
                          </div>
                          <span className="text-muted text-[0.75rem] transition-transform group-open:rotate-90">▸</span>
                        </div>
                      </summary>
                      <div className="border-line/40 space-y-4 border-t px-5 py-4">
                        {enrollment.sections.map((section, si) => (
                          <div key={si}>
                            <p className="text-muted mb-1.5 text-[0.75rem] font-medium tracking-wide uppercase">
                              {section.title}
                            </p>
                            <ul className="space-y-1">
                              {section.lessons.map((lesson) => (
                                <li key={lesson.id} className="flex items-center gap-2 text-[0.85rem]">
                                  {lesson.done ? (
                                    <CheckCircle2 className="text-forest size-4 shrink-0" />
                                  ) : (
                                    <Circle className="text-line size-4 shrink-0" />
                                  )}
                                  <span className={lesson.done ? "text-ink" : "text-muted"}>{lesson.title}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </section>
          </Reveal>

          <Reveal delay={0.15}>
            <section className="space-y-4">
              <h2 className="font-display text-ink text-[1.3rem] font-medium">Payments</h2>
              {orders.length === 0 ? (
                <p className="text-muted text-[0.9rem]">No orders yet.</p>
              ) : (
                <div className="border-line/50 bg-cream-warm overflow-hidden rounded-2xl border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-forest/5 text-muted border-line/50 border-b">
                        <tr>
                          <th className="px-6 py-3.5 text-[0.72rem] font-medium tracking-wider uppercase">Course</th>
                          <th className="px-6 py-3.5 text-[0.72rem] font-medium tracking-wider uppercase">Date</th>
                          <th className="px-6 py-3.5 text-[0.72rem] font-medium tracking-wider uppercase">Status</th>
                          <th className="px-6 py-3.5 text-right text-[0.72rem] font-medium tracking-wider uppercase">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-line/30 divide-y">
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-3.5">
                              <span className="text-ink inline-flex items-center gap-2 font-medium">
                                <Receipt className="text-forest/70 size-3.5" />
                                {order.courseTitle}
                              </span>
                            </td>
                            <td className="text-muted px-6 py-3.5 text-[0.85rem]">
                              {order.paidAt ? formatDate(order.paidAt) : order.createdAt ? formatDate(order.createdAt) : "—"}
                            </td>
                            <td className="px-6 py-3.5">
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-1 text-[0.72rem] font-medium capitalize",
                                  STATUS_STYLE[order.status] ?? "bg-line/60 text-muted",
                                )}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="text-ink px-6 py-3.5 text-right font-medium">{formatPrice(order.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </Reveal>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof BookOpen }) {
  return (
    <div className="border-line/50 bg-cream-warm rounded-2xl border p-5">
      <Icon className="text-forest/70 size-5" />
      <p className="text-ink mt-3 text-[1.5rem] font-medium">{value}</p>
      <p className="text-muted text-[0.8rem]">{label}</p>
    </div>
  );
}
