"use client";

import { FormEvent, useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { nowTs, toNumber } from "@/lib/firestoreHelpers";
import { generateDietPlan } from "@/lib/planGenerators";
import { GoalType } from "@/types";

export default function DietPlanPage() {
  const { authUser, appUser } = useAuth();
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [goal, setGoal] = useState<GoalType>("maintain");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("medium");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState<ReturnType<typeof generateDietPlan> | null>(null);

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

  const onGenerate = (e: FormEvent) => {
    e.preventDefault();
    setStatus("");
    const h = toNumber(heightCm);
    const w = toNumber(weightKg);
    if (!h || !w || !goal) {
      setStatus("Height, weight and goal are required.");
      return;
    }

    const generated = generateDietPlan({
      heightCm: h,
      weightKg: w,
      goal,
      age: toNumber(age),
      gender,
      activityLevel: activityLevel as "low" | "medium" | "high"
    });
    setPlan(generated);
  };

  const onSave = async () => {
    if (!authUser || !plan) return;
    await addDoc(collection(db, "plans"), {
      uid: authUser.uid,
      type: "diet",
      goal,
      generatedAt: nowTs(),
      summary: plan.summary,
      data: plan
    });
    setStatus("Diet plan saved.");
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h2 className="page-title">Diet Plan Generator</h2>
        <form onSubmit={onGenerate} className="app-card grid gap-3 p-4 sm:grid-cols-2">
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
          <select value={goal} onChange={(e) => setGoal(e.target.value as GoalType)}>
            <option value="bulk">Bulk</option>
            <option value="cut">Cut</option>
            <option value="maintain">Maintain</option>
          </select>
          <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
            <option value="low">Low activity</option>
            <option value="medium">Medium activity</option>
            <option value="high">High activity</option>
          </select>
          <input type="number" placeholder="Age (optional)" value={age} onChange={(e) => setAge(e.target.value)} />
          <input placeholder="Gender (optional)" value={gender} onChange={(e) => setGender(e.target.value)} />
          <div className="sm:col-span-2 flex gap-2">
            <button className="accent-btn">Generate</button>
            <button type="button" onClick={onSave} disabled={!plan} className="subtle-btn disabled:opacity-50">
              Save Plan
            </button>
          </div>
          {status && <p className="sm:col-span-2 text-sm text-emerald-300">{status}</p>}
        </form>

        {plan && (
          <div className="app-card mt-4 p-4">
            <p className="font-semibold text-white">{plan.summary}</p>
            <p className="mt-1 text-sm text-slate-300">BMI: {plan.metrics.bmi}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {plan.sevenDayPlan.map((day) => (
                <div key={day.day} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                  <p className="font-semibold text-white">{day.day}</p>
                  <p>Breakfast: {day.meals.breakfast}</p>
                  <p>Lunch: {day.meals.lunch}</p>
                  <p>Dinner: {day.meals.dinner}</p>
                  <p>Snacks: {day.meals.snacks}</p>
                  <p className="mt-1 text-slate-300">{day.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
