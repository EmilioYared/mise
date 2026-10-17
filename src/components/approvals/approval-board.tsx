"use client";

import { useState } from "react";
import { useApprovals } from "@/lib/approvals";
import { useAssignees } from "@/lib/tasks";
import type { Approval, UserProfile } from "@/lib/types";
import { DecisionButtons } from "./decision-buttons";
import { RequestForm } from "./request-form";

const STATUS_STYLE: Record<Approval["status"], string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const STATUS_LABEL: Record<Approval["status"], string> = {
  pending: "Waiting",
  approved: "Approved",
  rejected: "Rejected",
};

type Props = { profile: UserProfile };

export function ApprovalBoard({ profile }: Props) {
  const approvals = useApprovals(profile);
  const team = useAssignees(profile);
  const [composing, setComposing] = useState(false);

  const isManager = profile.role === "manager";
  const names = new Map(team.map((p) => [p.uid, p.name]));

  if (approvals.status === "loading") {
    return <p className="mt-8 text-sm text-zinc-500">Loading requests…</p>;
  }
  if (approvals.status === "error") {
    return (
      <p role="alert" className="mt-8 text-sm text-red-600">
        Couldn&apos;t load requests. Check your connection and refresh.
      </p>
    );
  }

  const pending = approvals.value.filter((a) => a.status === "pending");
  const decided = approvals.value.filter((a) => a.status !== "pending");

  function row(approval: Approval) {
    return (
      <li
        key={approval.id}
        className="flex items-start gap-3 rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800"
      >
        <div className="min-w-0 flex-1">
          <p>{approval.title}</p>
          {approval.details && (
            <p className="mt-0.5 text-sm text-zinc-500">{approval.details}</p>
          )}
          {isManager && (
            <p className="mt-1 text-xs text-zinc-500">
              From {names.get(approval.requesterId) ?? "a team member"}
            </p>
          )}
        </div>
        {isManager && approval.status === "pending" ? (
          <DecisionButtons approval={approval} managerId={profile.uid} />
        ) : (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[approval.status]}`}
          >
            {STATUS_LABEL[approval.status]}
          </span>
        )}
      </li>
    );
  }

  return (
    <section className="mt-8 grid gap-8">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            {isManager ? "Waiting for you" : "My requests"}
          </h2>
          {!isManager && (
            <button
              onClick={() => setComposing(true)}
              disabled={composing}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
            >
              New request
            </button>
          )}
        </div>

        {composing && (
          <div className="mt-4">
            <RequestForm profile={profile} onDone={() => setComposing(false)} />
          </div>
        )}

        {pending.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            {isManager
              ? "Nothing to approve. All caught up."
              : "No open requests."}
          </p>
        ) : (
          <ul className="mt-4 grid gap-2">{pending.map(row)}</ul>
        )}
      </div>

      {decided.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Decided</h2>
          <ul className="mt-4 grid gap-2">{decided.map(row)}</ul>
        </div>
      )}
    </section>
  );
}
