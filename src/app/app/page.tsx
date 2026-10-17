"use client";

import { useAuth } from "@/components/auth-provider";
import { TaskBoard } from "@/components/tasks/task-board";

export default function TasksPage() {
  const state = useAuth();
  if (state.status !== "signed-in") return null;
  return <TaskBoard profile={state.profile} store={state.store} />;
}
