"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { signOutUser, useAuth } from "@/components/auth-provider";

/**
 * Keeps signed-out visitors out of the app pages. This is for the experience
 * only: the data itself is protected by the Firestore security rules.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const state = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.status === "signed-out") router.replace("/login");
  }, [state.status, router]);

  if (state.status === "no-profile") {
    return (
      <div className="m-auto max-w-sm p-6 text-center">
        <p>
          Your account isn&apos;t linked to a store yet. Ask your manager to add
          you.
        </p>
        <button onClick={signOutUser} className="mt-4 underline">
          Sign out
        </button>
      </div>
    );
  }

  if (state.status !== "signed-in") {
    return <p className="m-auto text-sm text-zinc-500">Loading…</p>;
  }

  return <>{children}</>;
}
