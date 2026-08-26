import { adminApi } from "@/lib/api";
import { requireSession } from "@/lib/session";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/format";
import { Mail, ShieldCheck, User as UserIcon } from "lucide-react";

export const metadata = { title: "Admin - Users" };

export default async function AdminUsersPage() {
  const { accessToken } = await requireSession();
  const users = await adminApi.users(accessToken);

  return (
    <div className="space-y-10">
      <Reveal>
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Users</h1>
          <p className="text-muted mt-2 text-[0.95rem]">
            Manage registered students and admins.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="bg-cream-warm border border-line/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-forest/5 text-muted border-b border-line/50">
                <tr>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">User</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Role</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Joined</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem] text-right">Enrollments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/30">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-forest/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-sand size-10 rounded-full flex items-center justify-center shrink-0">
                          <UserIcon className="size-5 text-forest" />
                        </div>
                        <div>
                          <p className="font-medium text-ink text-[0.95rem]">{user.name}</p>
                          <div className="flex items-center gap-1.5 text-muted text-[0.8rem] mt-0.5">
                            <Mail className="size-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] font-medium ${user.role === 'admin' ? 'bg-forest text-cream' : 'bg-forest/10 text-forest'}`}>
                        {user.role === 'admin' && <ShieldCheck className="size-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted text-[0.85rem]">
                      {user.createdAt ? formatDate(user.createdAt) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-ink">
                      {user.enrollmentCount}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted">
                      No users found.
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
