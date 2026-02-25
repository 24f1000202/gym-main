"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicOnly from "@/components/PublicOnly";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || password.length < 6) {
      setError("Name, email and password (min 6 chars) are required.");
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password });
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
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Get Started</p>
          <h1 className="mt-2 mb-4 text-3xl font-semibold text-white">Create account</h1>
          <div className="space-y-3">
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-rose-300">{error}</p>}
            <button disabled={loading} className="accent-btn w-full disabled:opacity-60">
              {loading ? "Creating..." : "Register"}
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-300 underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </PublicOnly>
  );
}
