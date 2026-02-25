"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { db } from "@/lib/firebase";
import { AppUser } from "@/types";

interface UserRow extends AppUser {
  id: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
      setUsers(snap.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as AppUser) })));
      setLoading(false);
    };
    load();
  }, []);

  return (
    <ProtectedRoute adminOnly>
      <AppShell>
        <h2 className="page-title">Admin: Users</h2>
        <p className="mb-4 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-200">
          To promote a member to admin, update their Firestore document: users/uid.role = &quot;admin&quot;.
        </p>

        {loading ? (
          <p className="text-sm text-slate-300">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="app-card p-4 text-sm text-slate-300">No users found.</p>
        ) : (
          <div className="app-card overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-slate-200">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Goal</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/10 text-slate-300">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">{user.profile?.goal ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
