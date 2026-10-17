"use client";

import { motion } from "motion/react";
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
    "w-full rounded-lg border-2 border-steel-deep bg-ticket px-3 py-2.5 focus:border-tape focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">What do you need?</span>
        <input
          autoFocus
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Replace the fryer thermostat"
          className={`${field} font-display text-2xl font-bold`}
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">
          Details <span className="font-normal text-ink-soft">(optional)</span>
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
        <p role="alert" className="text-sm font-medium text-expo">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-dashed border-steel-deep pt-4">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg px-4 py-2.5 font-medium text-ink-soft hover:bg-steel"
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          disabled={sending || !title.trim()}
          className="rounded-lg bg-tape px-5 py-2.5 font-semibold text-white shadow-[0_2px_0_#1d4fa8] disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send request"}
        </motion.button>
      </div>
    </form>
  );
}
