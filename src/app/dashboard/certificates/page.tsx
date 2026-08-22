import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, Download } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Reveal } from "@/components/ui/Reveal";
import { certificates, formatDate, student } from "@/data/student";
import { courses } from "@/data/courses";

export const metadata: Metadata = { title: "Certificates" };

export default function CertificatesPage() {
  const earned = certificates.flatMap((certificate) => {
    const course = courses.find((entry) => entry.slug === certificate.courseSlug);
    return course ? [{ ...certificate, course }] : [];
  });

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
            href="/dashboard/courses"
            className="bg-forest text-cream hover:bg-forest-deep mt-7 inline-flex rounded-full px-6 py-3 text-[0.9rem] font-medium transition-colors"
          >
            Back to my courses
          </Link>
        </Reveal>
      ) : (
        <ul className="grid gap-7 lg:grid-cols-2">
          {earned.map((certificate, index) => (
            <Reveal as="li" key={certificate.id} delay={(index % 2) * 0.08}>
              <article className="border-line/80 bg-cream-warm/50 overflow-hidden rounded-2xl border">
                {/* Certificate face — deliberately styled like the printed article. */}
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
                      {certificate.course.title}
                    </p>
                    <p className="font-script text-cream/85 mt-5 text-2xl">
                      {student.name}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                  <div>
                    <p className="text-muted text-[0.75rem]">
                      Issued {formatDate(certificate.issuedOn)}
                    </p>
                    <p className="text-ink mt-1 font-mono text-[0.78rem]">
                      {certificate.credentialId}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    title="PDF export arrives with the backend"
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
