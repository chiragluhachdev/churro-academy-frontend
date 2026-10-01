import { CheckCircle2, ExternalLink, Radio, Users } from "lucide-react";

import { LiveSessionForm } from "@/components/admin/LiveSessionForm";
import { Reveal } from "@/components/ui/Reveal";
import { adminApi } from "@/lib/api";
import { requireSession } from "@/lib/session";

export const metadata = { title: "Admin - Live sessions" };

export default async function AdminLiveSessionsPage() {
  const { accessToken } = await requireSession();
  const sessions = await adminApi.liveSessions(accessToken);

  return (
    <div className="space-y-8">
      <Reveal>
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Live sessions</h1>
          <p className="text-muted mt-2 text-[0.95rem]">
            Announce a live class with a link, date and time — every student who has paid for a course gets it
            by email.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <LiveSessionForm />
      </Reveal>

      <Reveal delay={0.1}>
        <div>
          <h2 className="font-display text-ink mb-4 text-[1.15rem] font-medium">Past announcements</h2>
          <div className="bg-cream-warm border-line/50 divide-line/30 divide-y overflow-hidden rounded-2xl border">
            {sessions.map((session) => (
              <div key={session.id} className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
                <div>
                  <p className="text-ink flex items-center gap-2 font-medium">
                    <Radio className="text-forest size-4" />
                    {session.title}
                  </p>
                  <p className="text-muted mt-1 text-[0.82rem]">
                    {new Date(session.scheduledAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    IST
                  </p>
                  {session.description && (
                    <p className="text-muted mt-1.5 max-w-xl text-[0.82rem]">{session.description}</p>
                  )}
                  <a
                    href={session.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-forest mt-2 flex items-center gap-1.5 text-[0.8rem] font-medium"
                  >
                    {session.link}
                    <ExternalLink className="size-3.5 shrink-0" />
                  </a>
                </div>
                <div className="text-muted flex flex-col items-end gap-1 text-[0.8rem]">
                  {session.sentAt ? (
                    <span className="text-forest flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5" />
                      Sent {new Date(session.sentAt).toLocaleDateString("en-IN")}
                    </span>
                  ) : (
                    <span>Not sent yet</span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    {session.recipientCount} reached
                    {session.failedCount > 0 && `, ${session.failedCount} failed`}
                  </span>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-muted px-6 py-12 text-center text-[0.9rem]">No announcements sent yet.</p>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
