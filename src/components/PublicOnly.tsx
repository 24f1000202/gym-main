"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function PublicOnly({ children }: { children: React.ReactNode }) {
  const { authUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && authUser) {
      router.replace("/dashboard");
    }
  }, [authUser, loading, router]);

  if (loading) {
    return <p className="p-6 text-sm text-slate-300">Loading...</p>;
  }

  if (authUser) {
    return <p className="p-6 text-sm text-slate-300">Redirecting...</p>;
  }

  return <>{children}</>;
}
