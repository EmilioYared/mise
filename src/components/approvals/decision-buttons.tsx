"use client";

import { FirebaseError } from "firebase/app";
import { motion } from "motion/react";
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

type Props = {
  approval: Approval;
  managerId: string;
  /** Called when a decision starts, and when it ends (saved or not). */
  onStart: () => void;
  onEnd: (saved: boolean) => void;
};

/**
 * Approve / Reject with every state visible: a spinner while saving, a stamp
 * and a toast on success, an inline error on failure. A ref blocks a second
 * click before React has re-rendered the disabled buttons.
 */
export function DecisionButtons({
  approval,
  managerId,
  onStart,
  onEnd,
}: Props) {
  const [saving, setSaving] = useState<Decision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function decide(decision: Decision) {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(decision);
    setError(null);
    onStart();
    try {
      await decideApproval(approval, decision, managerId);
      toast.success(
        `${decision === "approved" ? "Approved" : "Rejected"}: ${approval.title}`,
      );
      onEnd(true);
    } catch (err) {
      console.error(err);
      setError(messageFor(err));
      setSaving(null);
      inFlight.current = false;
      onEnd(false);
    }
  }

  const base =
    "inline-flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 font-semibold disabled:cursor-not-allowed";

  return (
    <div className="grid gap-2">
      <div className="flex gap-2" aria-busy={saving !== null}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => decide("rejected")}
          disabled={saving !== null}
          className={`${base} border-2 border-steel-deep text-ink-soft hover:border-expo hover:text-expo ${
            saving === "approved" ? "opacity-40" : ""
          }`}
        >
          {saving === "rejected" && <Spinner />}
          {saving === "rejected" ? "Rejecting…" : "Reject"}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => decide("approved")}
          disabled={saving !== null}
          className={`${base} bg-basil text-white shadow-[0_2px_0_#1f6141] hover:brightness-110 ${
            saving === "rejected" ? "opacity-40" : ""
          }`}
        >
          {saving === "approved" && <Spinner />}
          {saving === "approved" ? "Approving…" : "Approve"}
        </motion.button>
      </div>
      {error && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }}
          transition={{ duration: 0.4 }}
          className="text-sm font-medium text-expo"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
