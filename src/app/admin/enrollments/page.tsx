import Link from "next/link";
import { adminApi } from "@/lib/api";
import { requireSession } from "@/lib/session";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate, formatPrice } from "@/lib/format";
import { CheckCircle2, User as UserIcon, BookOpen } from "lucide-react";

export const metadata = { title: "Admin - Enrollments" };

export default async function AdminEnrollmentsPage() {
  const { accessToken } = await requireSession();
  const enrollments = await adminApi.enrollments(accessToken);

  return (
    <div className="space-y-10">
      <Reveal>
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Enrollments</h1>
          <p className="text-muted mt-2 text-[0.95rem]">
            Recent course purchases and registrations.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="bg-cream-warm border border-line/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-forest/5 text-muted border-b border-line/50">
                <tr>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Student</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Course</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Date</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem] text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/30">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-forest/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-sand size-8 rounded-full flex items-center justify-center shrink-0">
                          <UserIcon className="size-4 text-forest" />
                        </div>
                        <div>
                          {enrollment.user ? (
                            <Link
                              href={`/admin/users/${enrollment.user.id}`}
                              className="font-medium text-ink text-[0.95rem] hover:text-forest hover:underline"
                            >
                              {enrollment.user.name}
                            </Link>
                          ) : (
                            <p className="font-medium text-ink text-[0.95rem]">Unknown</p>
                          )}
                          <p className="text-muted text-[0.75rem]">
                            {enrollment.user?.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="size-4 text-forest/70" />
                        <span className="font-medium text-ink text-[0.95rem]">
                          {enrollment.course?.title || "Unknown Course"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted text-[0.85rem]">
                      {formatDate(enrollment.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {enrollment.paymentStatus === 'paid' && (
                          <span className="bg-forest/10 text-forest p-1 rounded-full" title="Paid">
                            <CheckCircle2 className="size-3" />
                          </span>
                        )}
                        <span className="font-medium text-ink">
                          {formatPrice(enrollment.amountPaid)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted">
                      No enrollments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
