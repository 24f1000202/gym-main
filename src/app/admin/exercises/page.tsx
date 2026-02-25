"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc
} from "firebase/firestore";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { db } from "@/lib/firebase";
import { defaultExercises } from "@/lib/defaultExercises";
import { nowTs } from "@/lib/firestoreHelpers";
import { Exercise } from "@/types";

const emptyForm = {
  name: "",
  muscleGroup: "",
  equipment: "bodyweight",
  difficulty: "beginner",
  instructions: "",
  imageUrl: "",
  videoUrl: ""
};

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const load = async () => {
    const snap = await getDocs(query(collection(db, "exercises"), orderBy("name")));
    setExercises(snap.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as Exercise) })));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("");
    if (!form.name || !form.muscleGroup || !form.instructions) {
      setStatus("Fill all required fields.");
      return;
    }

    const payload = {
      name: form.name,
      muscleGroup: form.muscleGroup,
      equipment: form.equipment as Exercise["equipment"],
      difficulty: form.difficulty as Exercise["difficulty"],
      instructions: form.instructions,
      imageUrl: form.imageUrl || "",
      videoUrl: form.videoUrl || "",
      updatedAt: nowTs()
    };

    if (editingId) {
      await updateDoc(doc(db, "exercises", editingId), payload);
      setStatus("Exercise updated.");
    } else {
      await addDoc(collection(db, "exercises"), { ...payload, createdAt: nowTs() });
      setStatus("Exercise added.");
    }

    setForm(emptyForm);
    setEditingId(null);
    await load();
  };

  const onEdit = (exercise: Exercise) => {
    setEditingId(exercise.id ?? null);
    setForm({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      instructions: exercise.instructions,
      imageUrl: exercise.imageUrl ?? "",
      videoUrl: exercise.videoUrl ?? ""
    });
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    await deleteDoc(doc(db, "exercises", id));
    await load();
  };

  const addSampleExercises = async () => {
    setStatus("Adding sample exercises...");
    await Promise.all(
      defaultExercises.map((exercise) =>
        addDoc(collection(db, "exercises"), {
          ...exercise,
          imageUrl: exercise.imageUrl ?? "",
          videoUrl: exercise.videoUrl ?? "",
          createdAt: nowTs(),
          updatedAt: nowTs()
        })
      )
    );
    await load();
    setStatus("Sample exercises added.");
  };

  return (
    <ProtectedRoute adminOnly>
      <AppShell>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="page-title mb-0">Admin: Exercises</h2>
          <button className="accent-btn" onClick={addSampleExercises}>
            Add Sample Exercises
          </button>
        </div>
        <form onSubmit={onSubmit} className="app-card grid gap-3 p-4 sm:grid-cols-2">
          <input
            placeholder="Exercise name"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            placeholder="Muscle group"
            value={form.muscleGroup}
            onChange={(e) => setForm((s) => ({ ...s, muscleGroup: e.target.value }))}
          />
          <select value={form.equipment} onChange={(e) => setForm((s) => ({ ...s, equipment: e.target.value }))}>
            <option value="bodyweight">bodyweight</option>
            <option value="dumbbell">dumbbell</option>
            <option value="barbell">barbell</option>
            <option value="machine">machine</option>
            <option value="band">band</option>
            <option value="other">other</option>
          </select>
          <select value={form.difficulty} onChange={(e) => setForm((s) => ({ ...s, difficulty: e.target.value }))}>
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
          <textarea
            className="sm:col-span-2"
            placeholder="Instructions"
            value={form.instructions}
            onChange={(e) => setForm((s) => ({ ...s, instructions: e.target.value }))}
          />
          <input
            className="sm:col-span-2"
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))}
          />
          <input
            className="sm:col-span-2"
            placeholder="Video URL (optional)"
            value={form.videoUrl}
            onChange={(e) => setForm((s) => ({ ...s, videoUrl: e.target.value }))}
          />
          <div className="sm:col-span-2 flex gap-2">
            <button className="accent-btn">{editingId ? "Update" : "Add"} Exercise</button>
            {editingId && (
              <button
                type="button"
                className="subtle-btn"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
          {status && <p className="sm:col-span-2 text-sm text-emerald-300">{status}</p>}
        </form>

        <div className="mt-4 space-y-2">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="app-card flex items-center justify-between gap-3 p-3">
              <div className="flex min-w-0 items-center gap-3">
                {exercise.imageUrl ? (
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-white/10">
                    <Image src={exercise.imageUrl} alt={exercise.name} fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="h-14 w-14 rounded-lg border border-white/10 bg-white/5" />
                )}
                <div>
                  <p className="font-medium text-white">{exercise.name}</p>
                  <p className="text-sm text-slate-300">
                    {exercise.muscleGroup} • {exercise.equipment} • {exercise.difficulty}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="subtle-btn" onClick={() => onEdit(exercise)}>
                  Edit
                </button>
                <button
                  className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => onDelete(exercise.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {exercises.length === 0 && <p className="app-card p-4 text-sm text-slate-300">No exercises yet.</p>}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
