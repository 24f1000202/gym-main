"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { nowTs, toNumber } from "@/lib/firestoreHelpers";

interface Entry {
  id: string;
  uid: string;
  date: string;
  weightKg?: number;
  workoutNotes: string;
  dietNotes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const emptyForm = {
  date: "",
  weightKg: "",
  workoutNotes: "",
  dietNotes: ""
};

export default function DataEntryPage() {
  const { authUser } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!authUser) return;
    try {
      setError("");
      const snap = await getDocs(query(collection(db, "entries"), where("uid", "==", authUser.uid)));
      setEntries(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Entry, "id">) })));
    } catch {
      setEntries([]);
      setError("Cannot load entries. Firestore rules are blocking access.");
    }
  }, [authUser]);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    setStatus("");
    setError("");

    if (!form.date || !form.workoutNotes || !form.dietNotes) {
      setStatus("Date, workout notes and diet notes are required.");
      return;
    }

    const payload = {
      uid: authUser.uid,
      date: form.date,
      weightKg: toNumber(form.weightKg),
      workoutNotes: form.workoutNotes,
      dietNotes: form.dietNotes,
      updatedAt: nowTs()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "entries", editingId), payload);
        setStatus("Entry updated.");
      } else {
        await addDoc(collection(db, "entries"), { ...payload, createdAt: nowTs() });
        setStatus("Entry saved.");
      }
    } catch {
      setError("Cannot save entry. Firestore rules are blocking write access.");
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    await load();
  };

  const onEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setForm({
      date: entry.date,
      weightKg: entry.weightKg?.toString() ?? "",
      workoutNotes: entry.workoutNotes,
      dietNotes: entry.dietNotes
    });
  };

  const onDelete = async (id: string) => {
    setError("");
    try {
      await deleteDoc(doc(db, "entries", id));
      await load();
    } catch {
      setError("Cannot delete entry. Firestore rules are blocking delete access.");
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h2 className="page-title">Data Entry</h2>
        <form onSubmit={onSubmit} className="app-card grid gap-3 p-4 sm:grid-cols-2">
          <input type="date" value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} />
          <input
            type="number"
            placeholder="Weight (kg) optional"
            value={form.weightKg}
            onChange={(e) => setForm((s) => ({ ...s, weightKg: e.target.value }))}
          />
          <textarea
            className="sm:col-span-2"
            placeholder="Workout notes"
            value={form.workoutNotes}
            onChange={(e) => setForm((s) => ({ ...s, workoutNotes: e.target.value }))}
          />
          <textarea
            className="sm:col-span-2"
            placeholder="Diet notes"
            value={form.dietNotes}
            onChange={(e) => setForm((s) => ({ ...s, dietNotes: e.target.value }))}
          />
          <div className="sm:col-span-2 flex gap-2">
            <button className="accent-btn">{editingId ? "Update" : "Save"} Entry</button>
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
          {error && <p className="sm:col-span-2 text-sm text-rose-300">{error}</p>}
        </form>

        <div className="mt-4 space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="app-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-300">{entry.date}</p>
                  {entry.weightKg && <p className="text-sm text-slate-300">Weight: {entry.weightKg} kg</p>}
                  <p className="mt-2 text-sm text-slate-200">Workout: {entry.workoutNotes}</p>
                  <p className="text-sm text-slate-200">Diet: {entry.dietNotes}</p>
                </div>
                <div className="flex gap-2">
                  <button className="subtle-btn" onClick={() => onEdit(entry)}>
                    Edit
                  </button>
                  <button className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white" onClick={() => onDelete(entry.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {entries.length === 0 && <p className="app-card p-4 text-sm text-slate-300">No entries yet.</p>}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
