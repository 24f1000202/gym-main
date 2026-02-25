"use client";

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
import { defaultTrainers } from "@/lib/defaultTrainers";
import { db } from "@/lib/firebase";
import { nowTs, toNumber } from "@/lib/firestoreHelpers";
import { Trainer } from "@/types";

const emptyForm = {
  name: "",
  specialization: "",
  experienceYears: "",
  phone: "",
  availability: ""
};

export default function AdminTrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const load = async () => {
    const snap = await getDocs(query(collection(db, "trainers"), orderBy("name")));
    setTrainers(snap.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as Trainer) })));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("");
    if (!form.name || !form.specialization || !form.experienceYears || !form.availability) {
      setStatus("Fill all required fields.");
      return;
    }

    const payload = {
      name: form.name,
      specialization: form.specialization,
      experienceYears: toNumber(form.experienceYears) ?? 0,
      phone: form.phone || "",
      availability: form.availability,
      updatedAt: nowTs()
    };

    if (editingId) {
      await updateDoc(doc(db, "trainers", editingId), payload);
      setStatus("Trainer updated.");
    } else {
      await addDoc(collection(db, "trainers"), { ...payload, createdAt: nowTs() });
      setStatus("Trainer added.");
    }

    setForm(emptyForm);
    setEditingId(null);
    await load();
  };

  const onEdit = (trainer: Trainer) => {
    setEditingId(trainer.id ?? null);
    setForm({
      name: trainer.name,
      specialization: trainer.specialization,
      experienceYears: String(trainer.experienceYears),
      phone: trainer.phone ?? "",
      availability: trainer.availability
    });
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    await deleteDoc(doc(db, "trainers", id));
    await load();
  };

  const addSampleTrainers = async () => {
    setStatus("Adding sample trainers...");
    await Promise.all(
      defaultTrainers.map((trainer) =>
        addDoc(collection(db, "trainers"), {
          ...trainer,
          createdAt: nowTs(),
          updatedAt: nowTs()
        })
      )
    );
    await load();
    setStatus("Sample trainers added.");
  };

  return (
    <ProtectedRoute adminOnly>
      <AppShell>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="page-title mb-0">Admin: Trainers</h2>
          <button className="accent-btn" onClick={addSampleTrainers}>
            Add Sample Trainers
          </button>
        </div>
        <form onSubmit={onSubmit} className="app-card grid gap-3 p-4 sm:grid-cols-2">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            placeholder="Specialization"
            value={form.specialization}
            onChange={(e) => setForm((s) => ({ ...s, specialization: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Experience years"
            value={form.experienceYears}
            onChange={(e) => setForm((s) => ({ ...s, experienceYears: e.target.value }))}
          />
          <input
            placeholder="Availability"
            value={form.availability}
            onChange={(e) => setForm((s) => ({ ...s, availability: e.target.value }))}
          />
          <input
            className="sm:col-span-2"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
          />
          <div className="sm:col-span-2 flex gap-2">
            <button className="accent-btn">{editingId ? "Update" : "Add"} Trainer</button>
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
          {trainers.map((trainer) => (
            <div key={trainer.id} className="app-card flex items-center justify-between p-3">
              <div>
                <p className="font-medium text-white">{trainer.name}</p>
                <p className="text-sm text-slate-300">
                  {trainer.specialization} • {trainer.experienceYears} years
                </p>
              </div>
              <div className="flex gap-2">
                <button className="subtle-btn" onClick={() => onEdit(trainer)}>
                  Edit
                </button>
                <button
                  className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => onDelete(trainer.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {trainers.length === 0 && <p className="app-card p-4 text-sm text-slate-300">No trainers yet.</p>}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
