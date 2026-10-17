import Link from "next/link";

export default function Home() {
  return (
    <main className="m-auto max-w-md p-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Mise</h1>
      <p className="mt-3 text-zinc-500">
        Tasks and approvals for restaurant teams across locations.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-white dark:bg-white dark:text-zinc-900"
      >
        Sign in
      </Link>
    </main>
  );
}
