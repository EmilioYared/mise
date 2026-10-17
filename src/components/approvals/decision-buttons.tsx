"use client";

import { FirebaseError } from "firebase/app";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlreadyDecidedError,
  decideApproval,
  type Decision,
} from "@/lib/approvals";
import type { Approval } from "@/lib/types";

function messageFor(error: unknown) {
  if (error instanceof AlreadyDecidedError) return error.message;
  if (error instanceof FirebaseError && error.code === "permission-denied") {
    return "You can't decide this request.";
  }
  return "Couldn't save your decision. Check your connection and try again.";
}

type Props = { approval: Approval; managerId: string };

/**
 * Approve / Reject with every state visible: a spinner while saving, a toast
 * on success, an inline error on failure. A ref blocks a second click before
 * React has re-rendered the disabled buttons.
 */
export function DecisionButtons({ approval, managerId }: Props) {
  const [saving, setSaving] = useState<Decision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function decide(decision: Decision) {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(decision);
    setError(null);
    try {
      await decideApproval(approval, decision, managerId);
      toast.success(
        `${decision === "approved" ? "Approved" : "Rejected"}: ${approval.title}`,
      );
      // On success the request moves to the decided list and this unmounts.
    } catch (err) {
      console.error(err);
      setError(messageFor(err));
      setSaving(null);
      inFlight.current = false;
    }
  }

  const base =
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2" aria-busy={saving !== null}>
        <button
          onClick={() => decide("rejected")}
          disabled={saving !== null}
          className={`${base} border border-zinc-300 dark:border-zinc-700`}
        >
          {saving === "rejected" && <Spinner />}
          {saving === "rejected" ? "Rejecting…" : "Reject"}
        </button>
        <button
          onClick={() => decide("approved")}
          disabled={saving !== null}
          className={`${base} bg-emerald-600 text-white`}
        >
          {saving === "approved" && <Spinner />}
          {saving === "approved" ? "Approving…" : "Approve"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-right text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
