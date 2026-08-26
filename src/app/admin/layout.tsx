import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, LayoutDashboard, Settings, Users, CreditCard, LogOut } from "lucide-react";
import { requireSession } from "@/lib/session";
import { Logo } from "@/components/brand/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { logoutAction } from "@/app/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession();

  if (user.role !== "admin") {
    redirect("/");
  }

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Enrollments", href: "/admin/enrollments", icon: CreditCard },
  ];

  return (
    <div className="bg-cream min-h-screen flex text-ink">
      {/* Sidebar */}
      <aside className="w-64 bg-forest-deep text-cream border-r border-line/20 flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="p-6 h-20 flex items-center border-b border-cream/10">
          <div className="flex items-center gap-3">
            <Logo tone="cream" />
            <span className="font-display font-medium text-lg tracking-wide">Admin</span>
          </div>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2">
          {navItems.map((item, index) => (
            <Reveal key={item.href} delay={index * 0.05} as="div">
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-forest transition-colors text-[0.95rem] font-medium"
              >
                <item.icon className="size-5 opacity-80" strokeWidth={1.5} />
                {item.label}
              </Link>
            </Reveal>
          ))}
        </nav>

        <div className="p-4 border-t border-cream/10">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-forest transition-colors text-[0.95rem] font-medium text-cream/80 hover:text-cream"
            >
              <LogOut className="size-5 opacity-80" strokeWidth={1.5} />
              Exit to site
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen relative p-10 md:p-14 lg:p-20">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
