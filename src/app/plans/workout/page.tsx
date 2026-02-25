"use client";

import { FormEvent, useEffect, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { nowTs } from "@/lib/firestoreHelpers";
import { generateWorkoutPlan } from "@/lib/planGenerators";
import { Exercise, GoalType } from "@/types";

export default function WorkoutPlanPage() {
  const { authUser, appUser } = useAuth();
  const [goal, setGoal] = useState<GoalType>("maintain");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [daysPerWeek, setDaysPerWeek] = useState<3 | 4 | 5>(3);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState<ReturnType<typeof generateWorkoutPlan> | null>(null);

  useEffect(() => {
    if (appUser?.profile?.goal) setGoal(appUser.profile.goal);
  }, [appUser?.profile?.goal]);

  useEffect(() => {
    const loadExercises = async () => {
      const snap = await getDocs(collection(db, "exercises"));
      setExercises(snap.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as Exercise) })));
    };
    loadExercises();
  }, []);

  const onGenerate = (e: FormEvent) => {
    e.preventDefault();
    setStatus("");
    setPlan(
      generateWorkoutPlan({
        goal,
        difficulty,
        daysPerWeek,
        exercises
      })
    );
  };

  const onSave = async () => {
    if (!authUser || !plan) return;
    await addDoc(collection(db, "plans"), {
      uid: authUser.uid,
      type: "workout",
      goal,
      generatedAt: nowTs(),
      summary: plan.summary,
      data: plan
    });
    setStatus("Workout plan saved.");
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h2 className="page-title">Workout Plan Generator</h2>
        <form onSubmit={onGenerate} className="app-card grid gap-3 p-4 sm:grid-cols-3">
          <select value={goal} onChange={(e) => setGoal(e.target.value as GoalType)}>
            <option value="bulk">Bulk</option>
            <option value="cut">Cut</option>
            <option value="maintain">Maintain</option>
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select value={daysPerWeek} onChange={(e) => setDaysPerWeek(Number(e.target.value) as 3 | 4 | 5)}>
            <option value={3}>3 days/week</option>
            <option value={4}>4 days/week</option>
            <option value={5}>5 days/week</option>
          </select>
          <div className="sm:col-span-3 flex gap-2">
            <button className="accent-btn">Generate</button>
            <button type="button" onClick={onSave} disabled={!plan} className="subtle-btn disabled:opacity-50">
              Save Plan
            </button>
          </div>
          {status && <p className="sm:col-span-3 text-sm text-emerald-300">{status}</p>}
        </form>

        {plan && (
          <div className="app-card mt-4 p-4">
            <p className="font-semibold text-white">{plan.summary}</p>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {plan.schedule.map((day) => (
                <div key={day.day} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="font-semibold text-white">
                    {day.day}: {day.title}
                  </p>
                  <p className="text-sm text-slate-300">{day.note}</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-200">
                    {day.exercises.map((exercise, idx) => (
                      <li key={`${exercise.name}-${idx}`}>
                        {exercise.name} ({exercise.muscleGroup}) - {exercise.sets} sets x {exercise.reps}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
