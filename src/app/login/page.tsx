"use client";

import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo";
import { firebase } from "@/lib/firebase/client";

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
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (state.status === "signed-in") router.replace("/app");
  }, [state.status, router]);

  async function signIn(emailToUse: string, passwordToUse: string) {
    setPending(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(
        firebase().auth,
        emailToUse,
        passwordToUse,
      );
    } catch (err) {
      setError(messageFor(err));
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void signIn(email, password);
  }

  return (
    <main className="m-auto w-full max-w-sm p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in to Mise</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          type="password"
          required
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-zinc-900 px-3 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">
          Just looking? Try a demo account:
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {Object.values(DEMO_ACCOUNTS).map((account) => (
            <button
              key={account.email}
              disabled={pending}
              onClick={() => signIn(account.email, DEMO_PASSWORD)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
