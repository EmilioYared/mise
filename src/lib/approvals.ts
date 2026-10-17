"use client";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { firebase } from "@/lib/firebase/client";
import { resolve, type Loadable, type Result } from "@/lib/live";
import type { Approval, UserProfile } from "@/lib/types";

export type Decision = "approved" | "rejected";

/** Thrown when someone else decided the request first. */
export class AlreadyDecidedError extends Error {
  constructor(public status: string) {
    super(`This request was already ${status}.`);
  }
}

/** Staff see their own requests; a manager sees the whole store's. */
export function useApprovals(profile: UserProfile): Loadable<Approval[]> {
  const isManager = profile.role === "manager";
  const key = isManager ? `store:${profile.storeId}` : `owner:${profile.uid}`;
  const [result, setResult] = useState<Result<Approval[]> | null>(null);

  useEffect(() => {
    const approvals = collection(firebase().db, "approvals");
    const q = isManager
      ? query(approvals, where("storeId", "==", profile.storeId))
      : query(approvals, where("requesterId", "==", profile.uid));

    return onSnapshot(
      q,
      (snap) =>
        setResult({
          key,
          value: snap.docs
            .map((d) => ({ ...d.data(), id: d.id }) as Approval)
            .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)),
        }),
      (error) => setResult({ key, error }),
    );
  }, [key, isManager, profile.storeId, profile.uid]);

  return resolve(result, key);
}

export function submitApproval(
  profile: UserProfile,
  input: { title: string; details: string },
) {
  return addDoc(collection(firebase().db, "approvals"), {
    title: input.title,
    ...(input.details ? { details: input.details } : {}),
    requesterId: profile.uid,
    storeId: profile.storeId,
    status: "pending",
    createdAt: Date.now(),
  });
}

/**
 * Records a manager's decision. A transaction, not a plain update, for two
 * reasons: it only resolves once the server has accepted the write (a plain
 * update shows locally first, so the button could report success that never
 * happened), and it re-reads the request, so two managers deciding at once
 * get a clear "already decided" instead of a silent overwrite.
 */
export function decideApproval(
  approval: Approval,
  decision: Decision,
  managerId: string,
) {
  const { db } = firebase();
  const ref = doc(db, "approvals", approval.id);

  return runTransaction(db, async (tx) => {
    const current = await tx.get(ref);
    const status = current.data()?.status as Approval["status"] | undefined;
    if (status !== "pending")
      throw new AlreadyDecidedError(status ?? "removed");
    tx.update(ref, {
      status: decision,
      decidedBy: managerId,
      decidedAt: Date.now(),
    });
  });
}
