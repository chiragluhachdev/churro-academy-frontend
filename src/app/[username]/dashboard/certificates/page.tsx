import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, Download } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/format";
import { fetchMyEnrollments } from "@/lib/api";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Certificates" };

/** Deterministic credential id from the course slug, e.g. CA-CFS-8842. */
function credentialId(slug: string, userId: string): string {
  const initials = slug
    .split("-")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3)
    .padEnd(3, "X");
  let hash = 0;
  for (const char of `${slug}${userId}`) hash = (hash * 31 + char.charCodeAt(0)) % 10000;
  return `CA-${initials}-${String(hash).padStart(4, "0")}`;
}

export default async function CertificatesPage() {
  const { user, accessToken } = await requireSession();
  const enrolled = await fetchMyEnrollments(accessToken);
  const earned = enrolled.filter((e) => e.isComplete);

  return (
    <div className="space-y-10">
      <Reveal>
        <DashboardHeader
          eyebrow="Certificates"
          title="Proof you finished."
          lede="A certificate is issued automatically when you complete every lesson in a course."
        />
      </Reveal>

      {earned.length === 0 ? (
        <Reveal className="border-line/80 rounded-2xl border border-dashed px-8 py-16 text-center">
          <Award className="text-forest/40 mx-auto size-10" strokeWidth={1.3} aria-hidden="true" />
          <p className="font-display text-ink mt-5 text-[1.3rem] font-medium">
            No certificates yet
          </p>
          <p className="text-muted mx-auto mt-2 max-w-sm text-[0.9rem] leading-[1.7]">
            Finish all the lessons in any course and your certificate appears here.
          </p>
          <Link
            href={`/${user.username}/dashboard/courses`}
            className="bg-forest text-cream hover:bg-forest-deep mt-7 inline-flex rounded-full px-6 py-3 text-[0.9rem] font-medium transition-colors"
          >
            Back to my courses
          </Link>
        </Reveal>
      ) : (
        <ul className="grid gap-7 lg:grid-cols-2">
          {earned.map((entry, index) => (
            <Reveal as="li" key={entry.course.id} delay={(index % 2) * 0.08}>
              <article className="border-line/80 bg-cream-warm/50 overflow-hidden rounded-2xl border">
                <div className="bg-forest-deep text-cream relative p-8">
                  <Image
                    src="/logo-mark.png"
                    alt=""
                    width={512}
                    height={512}
                    className="pointer-events-none absolute -right-8 -bottom-10 h-40 w-auto opacity-[0.07]"
                  />
                  <div className="relative">
                    <p className="text-cream/60 text-[0.68rem] tracking-[0.22em] uppercase">
                      Certificate of Completion
                    </p>
                    <p className="font-display mt-4 text-[1.45rem] leading-[1.25] font-medium text-balance">
                      {entry.course.title}
                    </p>
                    <p className="font-script text-cream/85 mt-5 text-2xl">{user.name}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                  <div>
                    <p className="text-muted text-[0.75rem]">
                      Issued {formatDate(entry.completedAt ?? entry.lastOpenedAt)}
                    </p>
                    <p className="text-ink mt-1 font-mono text-[0.78rem]">
                      {credentialId(entry.course.slug, user.id)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    title="PDF export is not built yet"
                    className="border-line text-ink inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[0.82rem] font-medium disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <Download className="size-3.5" aria-hidden="true" />
                    Download PDF
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
