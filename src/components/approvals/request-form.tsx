"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { submitApproval } from "@/lib/approvals";
import type { UserProfile } from "@/lib/types";

type Props = { profile: UserProfile; onDone: () => void };

export function RequestForm({ profile, onDone }: Props) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      await submitApproval(profile, {
        title: title.trim(),
        details: details.trim(),
      });
      toast.success("Request sent to your manager");
      onDone();
    } catch (err) {
      console.error(err);
      setError("Couldn't send the request. Please try again.");
      setSending(false);
    }
  }

  const field =
    "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <label className="grid gap-1 text-sm">
        <span className="font-medium">What do you need?</span>
        <input
          autoFocus
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Replace the fryer thermostat"
          className={field}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">
          Details <span className="font-normal text-zinc-500">(optional)</span>
        </span>
        <textarea
          rows={3}
          maxLength={1000}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Cost, supplier, dates…"
          className={field}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={sending || !title.trim()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {sending ? "Sending…" : "Send request"}
        </button>
      </div>
    </form>
  );
}
