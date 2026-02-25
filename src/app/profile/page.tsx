"use client";

import { FormEvent, useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { toNumber } from "@/lib/firestoreHelpers";
import { GoalType } from "@/types";

export default function ProfilePage() {
  const { authUser, appUser, refreshAppUser } = useAuth();
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [goal, setGoal] = useState<GoalType>("maintain");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("medium");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const profile = appUser?.profile;
    if (!profile) return;
    setHeightCm(profile.heightCm?.toString() ?? "");
    setWeightKg(profile.weightKg?.toString() ?? "");
    setGoal(profile.goal ?? "maintain");
    setAge(profile.age?.toString() ?? "");
    setGender(profile.gender ?? "");
    setActivityLevel(profile.activityLevel ?? "medium");
  }, [appUser?.profile]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    const profile = {
      heightCm: toNumber(heightCm),
      weightKg: toNumber(weightKg),
      goal,
      age: toNumber(age),
      gender: gender || undefined,
      activityLevel: activityLevel as "low" | "medium" | "high"
    };

    await updateDoc(doc(db, "users", authUser.uid), { profile });
    await refreshAppUser(authUser.uid);
    setStatus("Profile updated.");
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h2 className="page-title">My Profile</h2>
        <form onSubmit={onSubmit} className="app-card max-w-2xl space-y-3 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              placeholder="Height (cm)"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <select value={goal} onChange={(e) => setGoal(e.target.value as GoalType)}>
              <option value="bulk">Bulk</option>
              <option value="cut">Cut</option>
              <option value="maintain">Maintain</option>
            </select>
            <input type="number" placeholder="Age (optional)" value={age} onChange={(e) => setAge(e.target.value)} />
            <input placeholder="Gender (optional)" value={gender} onChange={(e) => setGender(e.target.value)} />
          </div>
          <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
            <option value="low">Low activity</option>
            <option value="medium">Medium activity</option>
            <option value="high">High activity</option>
          </select>
          <button className="accent-btn">Save Profile</button>
          {status && <p className="text-sm text-emerald-300">{status}</p>}
        </form>
      </AppShell>
    </ProtectedRoute>
  );
}
