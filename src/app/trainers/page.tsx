"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { defaultTrainers } from "@/lib/defaultTrainers";
import { db } from "@/lib/firebase";
import { Trainer } from "@/types";

export default function TrainersPage() {
  const [dbTrainers, setDbTrainers] = useState<Trainer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(query(collection(db, "trainers"), orderBy("name")));
      setDbTrainers(snap.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as Trainer) })));
      setLoading(false);
    };
    load();
  }, []);

  const trainers = dbTrainers.length > 0 ? dbTrainers : defaultTrainers;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return trainers.filter(
      (trainer) =>
        trainer.name.toLowerCase().includes(q) ||
        trainer.specialization.toLowerCase().includes(q) ||
        trainer.availability.toLowerCase().includes(q)
    );
  }, [search, trainers]);

  return (
    <ProtectedRoute>
      <AppShell>
        <h2 className="page-title">Trainer Information</h2>
        <input
          className="mb-4 max-w-md"
          placeholder="Search by name/specialization"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {dbTrainers.length === 0 && !loading && (
          <p className="mb-4 text-sm text-slate-300">
            Showing built-in sample trainers. Admin can use &quot;Add Sample Trainers&quot; to save them to Firestore.
          </p>
        )}
        {loading ? (
          <p className="text-sm text-slate-300">Loading trainers...</p>
        ) : filtered.length === 0 ? (
          <p className="app-card p-4 text-sm text-slate-300">No trainers found.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((trainer, idx) => (
              <div key={trainer.id ?? `${trainer.name}-${idx}`} className="app-card p-4">
                <p className="font-semibold text-white">{trainer.name}</p>
                <p className="text-sm text-emerald-300">{trainer.specialization}</p>
                <p className="mt-1 text-sm text-slate-200">Experience: {trainer.experienceYears} years</p>
                <p className="text-sm text-slate-200">Availability: {trainer.availability}</p>
                {trainer.phone && <p className="text-sm text-slate-200">Phone: {trainer.phone}</p>}
              </div>
            ))}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
