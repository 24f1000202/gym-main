"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicOnly from "@/components/PublicOnly";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicOnly>
      <div className="flex min-h-screen items-center justify-center p-4">
        <form onSubmit={onSubmit} className="app-card w-full max-w-md p-6 sm:p-7">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Welcome Back</p>
          <h1 className="mt-2 mb-4 text-3xl font-semibold text-white">Log in</h1>
          <div className="space-y-3">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-rose-300">{error}</p>}
            <button disabled={loading} className="accent-btn w-full disabled:opacity-60">
              {loading ? "Signing in..." : "Log in"}
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-300">
            No account?{" "}
            <Link href="/register" className="text-emerald-300 underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </PublicOnly>
  );
}
