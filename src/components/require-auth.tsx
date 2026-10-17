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
    return (
      <div className="m-auto flex flex-col items-center gap-4 text-ink-soft">
        <span
          aria-hidden
          className="ticket-edge block h-16 w-12 animate-bounce bg-ticket shadow-[0_8px_14px_-8px_rgba(27,33,39,0.5)]"
        />
        <p className="text-sm">Loading your store…</p>
      </div>
    );
  }

  return <>{children}</>;
}
