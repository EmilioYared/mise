"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode, type Ref } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Stamp } from "@/components/ui/stamp";
import { useApprovals } from "@/lib/approvals";
import { useAssignees } from "@/lib/tasks";
import type { Approval, UserProfile } from "@/lib/types";
import { DecisionButtons } from "./decision-buttons";
import { RequestForm } from "./request-form";

// How long a decided ticket stays in view, so its stamp can land.
const LINGER_MS = 1200;

type Props = { profile: UserProfile };

export function ApprovalBoard({ profile }: Props) {
  const approvals = useApprovals(profile);
  const team = useAssignees(profile);
  const [composing, setComposing] = useState(false);
  // Requests being decided right now stay on the "waiting" side until their
  // stamp has landed, even once the live data says they're decided.
  const [lingering, setLingering] = useState<string[]>([]);

  const isManager = profile.role === "manager";
  const names = new Map(team.map((p) => [p.uid, p.name]));

  if (approvals.status === "loading") {
    return <p className="mt-8 text-sm text-ink-soft">Loading requests…</p>;
  }
  if (approvals.status === "error") {
    return (
      <p role="alert" className="mt-8 text-sm text-expo">
        Couldn&apos;t load requests. Check your connection and refresh.
      </p>
    );
  }

  const holding = (a: Approval) => lingering.includes(a.id);
  const waiting = approvals.value.filter(
    (a) => a.status === "pending" || holding(a),
  );
  const decided = approvals.value.filter(
    (a) => a.status !== "pending" && !holding(a),
  );

  const release = (id: string) =>
    setLingering((ids) => ids.filter((x) => x !== id));

  return (
    <>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none font-black">
            {isManager ? "Waiting for you" : "My requests"}
          </h1>
          <p className="mt-2 text-ink-soft">
            {isManager
              ? "Requests from your team. Approve or reject each one."
              : "Ask your manager for supplies, repairs or time off."}
          </p>
        </div>
        {!isManager && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setComposing(true)}
            className="rounded-lg bg-tape px-4 py-2.5 font-semibold text-white shadow-[0_2px_0_#1d4fa8] hover:brightness-110"
          >
            New request
          </motion.button>
        )}
      </div>

      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {waiting.map((approval) => (
            <ApprovalTicket
              key={approval.id}
              approval={approval}
              from={isManager ? names.get(approval.requesterId) : undefined}
            >
              {isManager && approval.status === "pending" && (
                <DecisionButtons
                  approval={approval}
                  managerId={profile.uid}
                  onStart={() => setLingering((ids) => [...ids, approval.id])}
                  onEnd={(saved) =>
                    saved
                      ? setTimeout(() => release(approval.id), LINGER_MS)
                      : release(approval.id)
                  }
                />
              )}
            </ApprovalTicket>
          ))}
        </AnimatePresence>
      </ul>

      {waiting.length === 0 && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-dashed border-steel-deep px-6 py-14 text-center font-display text-3xl font-black"
        >
          {isManager
            ? "All caught up. Nothing to sign off."
            : "No open requests."}
        </motion.p>
      )}

      {decided.length > 0 && (
        <>
          <h2 className="mt-14 font-display text-3xl font-black">Decided</h2>
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {decided.map((approval) => (
                <ApprovalTicket
                  key={approval.id}
                  approval={approval}
                  from={isManager ? names.get(approval.requesterId) : undefined}
                  muted
                />
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}

      <Sheet
        open={composing}
        title="New request"
        onClose={() => setComposing(false)}
      >
        <RequestForm profile={profile} onDone={() => setComposing(false)} />
      </Sheet>
    </>
  );
}

function ApprovalTicket({
  approval,
  from,
  muted,
  children,
  ref,
}: {
  approval: Approval;
  from?: string;
  muted?: boolean;
  children?: ReactNode;
  ref?: Ref<HTMLLIElement>;
}) {
  const pending = approval.status === "pending";

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: -40, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    >
      <article
        className={`ticket-edge relative flex h-full flex-col gap-3 bg-ticket px-5 pt-7 pb-5 shadow-[0_12px_20px_-12px_rgba(27,33,39,0.5)] ${
          muted ? "opacity-80" : ""
        } ${pending ? "" : "pb-16"}`}
      >
        <p className="flex items-center justify-between gap-2 text-xs text-ink-soft">
          <span>{from ? `From ${from}` : "Request"}</span>
          {pending && !children && (
            <span className="flex items-center gap-1.5 font-semibold text-ink">
              <span className="size-2 animate-pulse rounded-full bg-mustard" />
              Waiting
            </span>
          )}
        </p>
        <h3 className="font-display text-[1.7rem] leading-[1.02] font-bold">
          {approval.title}
        </h3>
        {approval.details && (
          <p className="text-sm text-ink-soft">{approval.details}</p>
        )}

        <AnimatePresence>
          {!pending && (
            <motion.div key="stamp" className="absolute right-4 bottom-4">
              <Stamp
                label={approval.status === "approved" ? "Approved" : "Rejected"}
                tone={approval.status === "approved" ? "basil" : "expo"}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {children && (
          <div className="mt-auto border-t border-dashed border-steel-deep pt-4">
            {children}
          </div>
        )}
      </article>
    </motion.li>
  );
}
