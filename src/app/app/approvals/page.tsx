"use client";

import { ApprovalBoard } from "@/components/approvals/approval-board";
import { useAuth } from "@/components/auth-provider";

export default function ApprovalsPage() {
  const state = useAuth();
  if (state.status !== "signed-in") return null;
  return <ApprovalBoard profile={state.profile} />;
}
