"use client";

import { signOutUser, useAuth } from "@/components/auth-provider";
import { RequireAuth } from "@/components/require-auth";

function Dashboard() {
  const state = useAuth();
  if (state.status !== "signed-in") return null;
  const { profile, store } = state;

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hi, {profile.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-zinc-500">
            {profile.role === "manager" ? "Manager" : "Staff"} · {store.name}
          </p>
        </div>
        <button onClick={signOutUser} className="text-sm underline">
          Sign out
        </button>
      </header>
    </main>
  );
}

export default function AppPage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}
