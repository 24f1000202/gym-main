"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({
  children,
  adminOnly = false
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { authUser, appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!authUser) {
      router.replace("/login");
      return;
    }
    if (adminOnly && appUser?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [authUser, appUser, adminOnly, loading, router]);

  if (loading || !authUser) {
    return <p className="p-6 text-sm text-slate-300">Loading...</p>;
  }

  if (adminOnly && appUser?.role !== "admin") {
    return <p className="p-6 text-sm text-slate-300">Redirecting...</p>;
  }

  return <>{children}</>;
}
