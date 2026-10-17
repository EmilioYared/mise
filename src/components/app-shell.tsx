"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { signOutUser, useAuth } from "@/components/auth-provider";
import { useApprovals } from "@/lib/approvals";
import type { UserProfile } from "@/lib/types";
import { useNow } from "@/lib/use-now";

export function AppShell({ children }: { children: ReactNode }) {
  const state = useAuth();
  if (state.status !== "signed-in") return null;
  const { profile, store } = state;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-full flex-1 flex-col bg-steel font-text text-ink">
        <header className="bg-ink text-steel">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="font-display text-3xl font-black">
              Mise
            </Link>
            <StoreClock name={store.name} timeZone={store.timeZone} />
            <div className="flex items-center gap-3">
              <span className="hidden text-right text-sm leading-tight sm:block">
                {profile.name}
                <span className="block text-xs text-rail">
                  {profile.role === "manager" ? "Manager" : "Staff"}
                </span>
              </span>
              <button
                onClick={signOutUser}
                className="rounded-md border border-ink-soft px-3 py-1.5 text-sm hover:bg-ink-soft/40"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <Tabs profile={profile} />

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 sm:px-6">
          {children}
        </main>
      </div>
    </MotionConfig>
  );
}

function StoreClock({ name, timeZone }: { name: string; timeZone: string }) {
  const now = useNow(15_000);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(now);

  return (
    <p className="text-center leading-tight">
      <span className="block font-display text-2xl font-bold tabular-nums">
        {time}
      </span>
      <span className="block text-xs text-rail">{name}</span>
    </p>
  );
}

function Tabs({ profile }: { profile: UserProfile }) {
  const pathname = usePathname();
  const approvals = useApprovals(profile);
  const waiting =
    approvals.status === "ready"
      ? approvals.value.filter((a) => a.status === "pending").length
      : 0;

  const tabs = [
    { href: "/app", label: "Tasks", badge: 0 },
    { href: "/app/approvals", label: "Approvals", badge: waiting },
  ];

  return (
    <nav className="mx-auto mt-6 flex w-full max-w-5xl gap-2 px-4 sm:px-6">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-full px-4 py-2 font-display text-xl font-bold transition-colors ${
              active ? "text-steel" : "text-ink-soft hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {tab.label}
              <AnimatePresence>
                {tab.badge > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 600, damping: 20 }}
                    className="grid min-w-6 place-items-center rounded-full bg-expo px-1.5 font-text text-xs font-bold text-white"
                    aria-label={`${tab.badge} waiting`}
                  >
                    {tab.badge}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
