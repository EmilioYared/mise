"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { signOutUser, useAuth } from "@/components/auth-provider";

const NAV = [
  { href: "/app", label: "Tasks" },
  { href: "/app/approvals", label: "Approvals" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const state = useAuth();
  const pathname = usePathname();
  if (state.status !== "signed-in") return null;
  const { profile, store } = state;

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hi, {profile.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-zinc-500">
            {profile.role === "manager" ? "Manager" : "Staff"} · {store.name}
          </p>
        </div>
        <button onClick={signOutUser} className="text-sm underline">
          Sign out
        </button>
      </header>

      <nav className="mt-6 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {NAV.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`-mb-px border-b-2 px-3 py-2 text-sm ${
                active
                  ? "border-zinc-900 font-medium dark:border-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {children}
    </main>
  );
}
