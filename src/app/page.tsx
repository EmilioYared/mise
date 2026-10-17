import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/landing/smooth-scroll";
import { TicketRail } from "@/components/landing/ticket-rail";
import { TimeScrubber } from "@/components/landing/time-scrubber";

export const metadata: Metadata = {
  title: "Mise: tasks and approvals for restaurant teams",
};

const REPO = "https://github.com/EmilioYared/mise";

export default function Home() {
  return (
    <SmoothScroll>
      <div className="min-h-full flex-1 bg-steel font-text text-ink">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <span className="font-display text-3xl font-black">Mise</span>
          <Link
            href="/login"
            className="rounded-md px-3 py-2 font-medium hover:bg-steel-deep focus-visible:outline-3 focus-visible:outline-tape"
          >
            Sign in
          </Link>
        </header>

        <main>
          <section className="mx-auto max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-16">
            <h1 className="max-w-[14ch] font-display text-[clamp(3.5rem,11vw,8.5rem)] leading-[0.88] font-black tracking-[-0.01em]">
              Everything in its place, in every store.
            </h1>
            <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
              Mise keeps prep lists, deadlines and approvals for restaurant
              teams across locations. Cooks see their own work. Managers see the
              whole store and sign off requests from one screen.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href="/login"
                className="rounded-md bg-tape px-5 py-3 font-semibold text-white shadow-[0_2px_0_#1d4fa8] hover:brightness-110 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tape"
              >
                Try the demo
              </Link>
              <a
                href={REPO}
                className="rounded-sm py-1 font-medium underline decoration-rail underline-offset-4 hover:decoration-ink focus-visible:outline-3 focus-visible:outline-tape"
              >
                Read the source on GitHub
              </a>
            </div>
          </section>

          <TicketRail />

          <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
              <div>
                <h2 className="font-display text-5xl leading-[0.95] font-black sm:text-6xl">
                  Overdue means overdue where the store is.
                </h2>
                <p className="mt-6 max-w-[48ch] leading-relaxed text-ink-soft">
                  Each location keeps its own time zone, so a task turns overdue
                  at that store&apos;s midnight. Not at midnight in London, and
                  not by whatever clock is set on someone&apos;s phone.
                </p>
              </div>
              <TimeScrubber />
            </div>
          </section>

          <section className="bg-ink text-steel">
            <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-24 md:grid-cols-2">
              <div>
                <h2 className="font-display text-4xl font-black">
                  Staff see their own list.
                </h2>
                <p className="mt-4 max-w-[46ch] leading-relaxed text-steel-deep">
                  Add tasks, set a priority, tick them off. Delete one by
                  mistake and Undo brings it straight back.
                </p>
              </div>
              <div>
                <h2 className="font-display text-4xl font-black">
                  Managers see the store.
                </h2>
                <p className="mt-4 max-w-[46ch] leading-relaxed text-steel-deep">
                  Assign work to anyone on the team and approve or reject
                  requests. Every decision shows whether it saved, so nobody
                  wonders if the click worked.
                </p>
              </div>
              <p className="max-w-[70ch] border-t border-ink-soft pt-8 leading-relaxed text-steel-deep md:col-span-2">
                Who can see what is enforced by the database&apos;s security
                rules, not just hidden in the interface. Those rules have their
                own test suite, and every pull request has to pass it before it
                can merge.
              </p>
            </div>
          </section>
        </main>

        <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-10 text-sm text-ink-soft sm:px-6">
          <p>
            Built by Emilio Yared with Next.js, Firebase and Vercel. The demo
            resets with sample data.
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="underline underline-offset-4">
              Try the demo
            </Link>
            <a href={REPO} className="underline underline-offset-4">
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}
