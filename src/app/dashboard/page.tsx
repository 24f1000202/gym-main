"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";

interface DashboardStats {
  trainers: number;
  exercises: number;
  myPlans: number;
  users: number;
  entries: number;
}

export default function DashboardPage() {
  const { authUser, appUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ trainers: 0, exercises: 0, myPlans: 0, users: 0, entries: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!authUser) return;
      setLoading(true);
      setError("");
      try {
        const [trainersRes, exercisesRes, myPlansRes, entriesRes, usersRes] = await Promise.allSettled([
          getDocs(collection(db, "trainers")),
          getDocs(collection(db, "exercises")),
          getDocs(query(collection(db, "plans"), where("uid", "==", authUser.uid))),
          getDocs(query(collection(db, "entries"), where("uid", "==", authUser.uid))),
          appUser?.role === "admin" ? getDocs(collection(db, "users")) : Promise.resolve(null)
        ]);

        setStats({
          trainers: trainersRes.status === "fulfilled" ? trainersRes.value.size : 0,
          exercises: exercisesRes.status === "fulfilled" ? exercisesRes.value.size : 0,
          myPlans: myPlansRes.status === "fulfilled" ? myPlansRes.value.size : 0,
          entries: entriesRes.status === "fulfilled" ? entriesRes.value.size : 0,
          users: usersRes.status === "fulfilled" && usersRes.value ? usersRes.value.size : 0
        });

        if ([trainersRes, exercisesRes, myPlansRes, entriesRes].some((result) => result.status === "rejected")) {
          setError("Some dashboard data could not be loaded. Check Firestore rules deployment.");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authUser, appUser?.role]);

  return (
    <ProtectedRoute>
      <AppShell>
        <h2 className="page-title">Dashboard</h2>
        {error && <p className="mb-4 text-sm text-amber-300">{error}</p>}
        {loading ? (
          <p className="text-sm text-slate-300">Loading dashboard...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="app-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trainers</p>
              <p className="mt-2 text-3xl font-semibold text-white">{stats.trainers}</p>
            </div>
            <div className="app-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Exercises</p>
              <p className="mt-2 text-3xl font-semibold text-white">{stats.exercises}</p>
            </div>
            <div className="app-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">My Plans</p>
              <p className="mt-2 text-3xl font-semibold text-white">{stats.myPlans}</p>
            </div>
            <div className="app-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Data Entries</p>
              <p className="mt-2 text-3xl font-semibold text-white">{stats.entries}</p>
            </div>
            {appUser?.role === "admin" && (
              <div className="app-card p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Users</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stats.users}</p>
              </div>
            )}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
