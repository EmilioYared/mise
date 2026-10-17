"use client";

import { motion, useReducedMotion } from "motion/react";

type Ticket = {
  title: string;
  who: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  state?: "overdue" | "done" | "waiting";
  tilt: number;
};

const TICKETS: Ticket[] = [
  {
    title: "Deep clean the walk-in",
    who: "Sam",
    due: "Today",
    priority: "High",
    tilt: -2.5,
  },
  {
    title: "Fryer thermostat replacement",
    who: "Sam, for Maria",
    due: "Waiting for approval",
    priority: "Medium",
    state: "waiting",
    tilt: 1.5,
  },
  {
    title: "Temperature log for Tuesday",
    who: "Jordan",
    due: "Yesterday",
    priority: "High",
    state: "overdue",
    tilt: -1,
  },
  {
    title: "Count dry storage",
    who: "Jordan",
    due: "Tomorrow",
    priority: "Medium",
    tilt: 2.5,
  },
  {
    title: "Sharpen the line knives",
    who: "Theo",
    due: "Today",
    priority: "Low",
    state: "done",
    tilt: -2,
  },
];

/**
 * The page's one automatic motion: tickets drop onto the rail and settle,
 * the way they land on the pass during service.
 */
export function TicketRail() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden pt-3 pb-10">
      {/* The rail itself */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-3 h-3 bg-linear-to-b from-[#b7bec5] via-rail to-[#6f787f] shadow-[0_2px_0_rgba(27,33,39,0.15)]"
      />
      <ul className="relative mx-auto flex max-w-6xl gap-4 px-4 sm:gap-6 sm:px-6">
        {TICKETS.map((ticket, i) => (
          <motion.li
            key={ticket.title}
            className={`relative w-44 shrink-0 origin-top sm:w-52 ${i > 2 ? "hidden md:block" : ""} ${i > 3 ? "md:hidden lg:block" : ""}`}
            initial={
              reduceMotion ? false : { y: -260, rotate: ticket.tilt * 4 }
            }
            animate={{ y: 0, rotate: ticket.tilt }}
            transition={{
              type: "spring",
              stiffness: 170,
              damping: 11,
              mass: 0.9,
              delay: 0.25 + i * 0.12,
            }}
          >
            {/* Clip holding the ticket to the rail */}
            <span
              aria-hidden
              className="absolute -top-1 left-1/2 z-10 h-5 w-9 -translate-x-1/2 rounded-sm bg-ink/85"
            />
            <TicketCard ticket={ticket} />
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const overdue = ticket.state === "overdue";
  const done = ticket.state === "done";

  return (
    <article className="ticket-edge mt-2 bg-ticket px-4 pt-6 pb-5 font-text text-ink shadow-[0_10px_18px_-10px_rgba(27,33,39,0.45)]">
      <p className="flex items-baseline justify-between border-b border-dashed border-steel-deep pb-2 text-xs text-ink-soft">
        <span>{ticket.who}</span>
        <span
          className={
            ticket.priority === "High" ? "font-semibold text-expo" : undefined
          }
        >
          {ticket.priority}
        </span>
      </p>
      <h3
        className={`mt-3 font-display text-2xl leading-[1.05] font-bold ${done ? "text-ink-soft line-through decoration-2" : ""}`}
      >
        {ticket.title}
      </h3>
      <p
        className={`mt-4 text-sm ${overdue ? "font-semibold text-expo" : "text-ink-soft"}`}
      >
        {overdue ? `Overdue, due ${ticket.due.toLowerCase()}` : ticket.due}
      </p>
    </article>
  );
}
