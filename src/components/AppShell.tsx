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
    <div className="min-h-screen lg:grid lg:grid-cols-[320px_1fr]">
      <aside className="border-r border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Gym Management</p>
        <h1 className="mt-2 text-3xl text-white">Iron Arena</h1>
        <div
          className="mt-5 rounded-2xl border border-white/20 bg-cover bg-center p-4"
          style={{
            backgroundImage:
              "linear-gradient(160deg, rgba(3,6,12,0.2), rgba(3,6,12,0.82)), url('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80')"
          }}
        >
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Fuel / Focus / Form</p>
          <p className="mt-1 text-sm text-slate-200">Track members, programs and daily performance in one place.</p>
        </div>
        <nav className="mt-5 space-y-1.5">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-xl px-3 py-2.5 text-sm ${
                  active
                    ? "bg-gradient-to-r from-lime-300 to-cyan-300 text-slate-950"
                    : "border border-transparent text-slate-300 hover:border-white/15 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="photo-strip mt-6 grid-cols-2">
          <div
            className="photo-tile"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80')"
            }}
          >
            <span>Strength</span>
          </div>
          <div
            className="photo-tile"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=700&q=80')"
            }}
          >
            <span>Cardio</span>
          </div>
        </div>
      </aside>
      <main className="p-4 sm:p-6">
        <div className="app-card mb-6 flex flex-wrap items-center justify-between gap-2 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Signed in</p>
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
