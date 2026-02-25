"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { defaultExercises } from "@/lib/defaultExercises";
import { db } from "@/lib/firebase";
import { Exercise } from "@/types";

export default function ExercisesPage() {
  const [dbExercises, setDbExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [favoriteNames, setFavoriteNames] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("favoriteExerciseNames");
    if (stored) {
      setFavoriteNames(JSON.parse(stored) as string[]);
    }

    const load = async () => {
      const snap = await getDocs(query(collection(db, "exercises"), orderBy("name")));
      setDbExercises(snap.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as Exercise) })));
      setLoading(false);
    };
    load();
  }, []);

  const sourceExercises = dbExercises.length > 0 ? dbExercises : defaultExercises;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sourceExercises.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(q) ||
        exercise.muscleGroup.toLowerCase().includes(q) ||
        exercise.equipment.toLowerCase().includes(q)
    );
  }, [search, sourceExercises]);

  const toggleFavorite = (name: string) => {
    const next = favoriteNames.includes(name)
      ? favoriteNames.filter((item) => item !== name)
      : [...favoriteNames, name];
    setFavoriteNames(next);
    localStorage.setItem("favoriteExerciseNames", JSON.stringify(next));
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="rounded-2xl border border-white/10 bg-white/95 p-6 text-slate-900">
          <h2 className="text-center text-4xl font-semibold text-slate-900">Showing Results</h2>
          <input
            className="mx-auto mt-4 block max-w-xl rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900"
            placeholder="Search by name / muscle / equipment"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {dbExercises.length === 0 && !loading && (
            <p className="mt-2 text-center text-sm text-slate-600">
              Showing built-in sample exercises. Admin can use &quot;Add Sample Exercises&quot; to save them to Firestore.
            </p>
          )}

          {loading ? (
            <p className="mt-6 text-center text-sm text-slate-600">Loading exercises...</p>
          ) : filtered.length === 0 ? (
            <p className="mt-6 text-center text-sm text-slate-600">No exercises found.</p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((exercise, idx) => {
                const key = exercise.id ?? `${exercise.name}-${idx}`;
                const isFavorite = favoriteNames.includes(exercise.name);
                return (
                  <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="relative mx-auto h-48 w-full overflow-hidden rounded-lg bg-slate-100">
                      {exercise.imageUrl ? (
                        <Image src={exercise.imageUrl} alt={exercise.name} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">No image</div>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="rounded-md bg-indigo-900 px-3 py-1 text-xs font-medium text-white">
                        {exercise.muscleGroup}
                      </span>
                      <span className="rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white">
                        {exercise.equipment}
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{exercise.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{exercise.instructions}</p>
                    <button
                      className="mt-4 w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                      onClick={() => toggleFavorite(exercise.name)}
                    >
                      {isFavorite ? "Added To Favorites" : "Add To Favorites"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
