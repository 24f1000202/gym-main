"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

const memberLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/data-entry", label: "Data Entry" },
  { href: "/profile", label: "Profile" },
  { href: "/trainers", label: "Trainers" },
  { href: "/exercises", label: "Exercises" },
  { href: "/plans/diet", label: "Diet Plan" },
  { href: "/plans/workout", label: "Workout Plan" }
];

const adminLinks = [
  { href: "/admin/trainers", label: "Admin Trainers" },
  { href: "/admin/exercises", label: "Admin Exercises" },
  { href: "/admin/users", label: "Admin Users" }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { appUser, logout } = useAuth();

  const links = appUser?.role === "admin" ? [...memberLinks, ...adminLinks] : memberLinks;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-r border-white/10 bg-slate-950/80 p-5 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Gym Management</p>
        <h1 className="mt-2 mb-6 text-2xl font-semibold text-white">Control Panel</h1>
        <nav className="space-y-1.5">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-xl px-3 py-2.5 text-sm ${
                  active
                    ? "bg-emerald-400 text-slate-950"
                    : "border border-transparent text-slate-300 hover:border-white/15 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="p-4 sm:p-6">
        <div className="app-card mb-6 flex flex-wrap items-center justify-between gap-2 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in</p>
            <p className="font-medium text-white">{appUser?.email}</p>
          </div>
          <button onClick={logout} className="subtle-btn">
            Logout
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
