"use client";

import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo";
import { firebase } from "@/lib/firebase/client";

const DEMO_DETAILS: Record<string, string> = {
  manager:
    "Sees the whole Downtown LA store, assigns tasks and approves requests.",
  staff: "Sees only their own tasks, and sends requests to the manager.",
};

function messageFor(error: unknown) {
  if (
    error instanceof FirebaseError &&
    error.code === "auth/invalid-credential"
  ) {
    return "That email and password don't match.";
  }
  return "Couldn't sign in. Check your connection and try again.";
}

export default function LoginPage() {
  const state = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  // The email being signed in, so the right button shows progress.
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (state.status === "signed-in") router.replace("/app");
  }, [state.status, router]);

  async function signIn(emailToUse: string, passwordToUse: string) {
    setPending(emailToUse);
    setError(null);
    try {
      await signInWithEmailAndPassword(
        firebase().auth,
        emailToUse,
        passwordToUse,
      );
    } catch (err) {
      setError(messageFor(err));
      setPending(null);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void signIn(email, password);
  }

  const field =
    "w-full rounded-lg border-2 border-steel-deep bg-ticket px-3 py-2.5 focus:border-tape focus:outline-none";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-steel font-text text-ink">
      <header className="mx-auto flex w-full max-w-5xl items-center px-4 py-5 sm:px-6">
        <Link href="/" className="font-display text-3xl font-black">
          Mise
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-12 px-4 pt-6 pb-16 sm:px-6 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:gap-16">
        <section>
          <h1 className="font-display text-6xl leading-[0.9] font-black sm:text-7xl">
            Pick a station.
          </h1>
          <p className="mt-4 max-w-[46ch] text-ink-soft">
            Two demo accounts are ready with sample tasks and requests. Choose
            one to sign in straight away.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {Object.entries(DEMO_ACCOUNTS).map(([key, account], i) => {
              const busy = pending === account.email;
              return (
                <motion.button
                  key={account.email}
                  disabled={pending !== null}
                  onClick={() => signIn(account.email, DEMO_PASSWORD)}
                  initial={{ opacity: 0, y: -40, rotate: i ? 3 : -3 }}
                  animate={{ opacity: 1, y: 0, rotate: i ? 1.2 : -1.2 }}
                  whileHover={{ y: -6, rotate: 0 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                    delay: 0.1 + i * 0.1,
                  }}
                  className="ticket-edge flex flex-col items-start bg-ticket px-5 pt-7 pb-5 text-left shadow-[0_14px_24px_-14px_rgba(27,33,39,0.55)] disabled:cursor-wait"
                >
                  <span className="font-display text-3xl leading-none font-black">
                    {account.label}
                  </span>
                  <span className="mt-2 text-sm text-ink-soft">
                    {DEMO_DETAILS[key]}
                  </span>
                  <span className="mt-5 w-full border-t border-dashed border-steel-deep pt-3 text-sm font-semibold text-tape">
                    {busy
                      ? "Signing in…"
                      : "Sign in as " + account.label.toLowerCase()}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        <section className="md:pt-3">
          <h2 className="font-display text-3xl font-black">
            Or use your own account
          </h2>
          <form onSubmit={onSubmit} className="mt-5 grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
              />
            </label>
            {error && (
              <motion.p
                role="alert"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                transition={{ duration: 0.4 }}
                className="text-sm font-medium text-expo"
              >
                {error}
              </motion.p>
            )}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={pending !== null}
              className="rounded-lg bg-ink px-4 py-3 font-semibold text-steel disabled:opacity-60"
            >
              {pending === email && pending ? "Signing in…" : "Sign in"}
            </motion.button>
          </form>
        </section>
      </main>
    </div>
  );
}
