/**
 * Seeds demo stores, accounts, tasks and approvals. Safe to re-run: it resets
 * the demo data to the same starting point.
 *
 *   npm run seed:emulator   # local emulators (npm run emulators must be running)
 *   npm run seed            # real project; needs GOOGLE_APPLICATION_CREDENTIALS
 *                           # pointing to a service account key kept OUTSIDE the repo
 */
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../src/lib/demo";
import type { Approval, Role, Store, Task } from "../src/lib/types";

const useEmulator = process.argv.includes("--emulator");

if (useEmulator) {
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
}

initializeApp(
  useEmulator
    ? { projectId: "demo-mise" }
    : { projectId: "mise-tasks", credential: applicationDefault() },
);

const auth = getAuth();
const db = getFirestore();

const stores: Store[] = [
  { id: "downtown-la", name: "Downtown LA", timeZone: "America/Los_Angeles" },
  { id: "brooklyn", name: "Brooklyn", timeZone: "America/New_York" },
];

const people: {
  uid: string;
  email: string;
  name: string;
  role: Role;
  storeId: string;
}[] = [
  {
    uid: "maria",
    email: DEMO_ACCOUNTS.manager.email,
    name: "Maria Lopez",
    role: "manager",
    storeId: "downtown-la",
  },
  {
    uid: "sam",
    email: DEMO_ACCOUNTS.staff.email,
    name: "Sam Carter",
    role: "staff",
    storeId: "downtown-la",
  },
  {
    uid: "jordan",
    email: "jordan@mise.demo",
    name: "Jordan Lee",
    role: "staff",
    storeId: "downtown-la",
  },
  {
    uid: "priya",
    email: "priya@mise.demo",
    name: "Priya Shah",
    role: "manager",
    storeId: "brooklyn",
  },
  {
    uid: "theo",
    email: "theo@mise.demo",
    name: "Theo Grant",
    role: "staff",
    storeId: "brooklyn",
  },
];

/** A calendar date `offset` days from today, in the given time zone. */
function dayIn(timeZone: string, offset: number): string {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone }).format(
    new Date(),
  );
  const date = new Date(`${today}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

const la = (offset: number) => dayIn("America/Los_Angeles", offset);
const bk = (offset: number) => dayIn("America/New_York", offset);

const tasks: Omit<Task, "id">[] = [
  {
    title: "Deep clean the walk-in fridge",
    ownerId: "sam",
    storeId: "downtown-la",
    dueDate: la(0),
    priority: "high",
    done: false,
  },
  {
    title: "Count bar inventory",
    ownerId: "sam",
    storeId: "downtown-la",
    dueDate: la(-1),
    priority: "medium",
    done: false,
  },
  {
    title: "Restock to-go containers",
    ownerId: "sam",
    storeId: "downtown-la",
    dueDate: la(2),
    priority: "low",
    done: false,
  },
  {
    title: "Log fridge temperatures",
    ownerId: "sam",
    storeId: "downtown-la",
    dueDate: la(-2),
    priority: "high",
    done: true,
  },
  {
    title: "Train new host on the POS",
    ownerId: "jordan",
    storeId: "downtown-la",
    dueDate: la(1),
    priority: "medium",
    done: false,
  },
  {
    title: "Fix wobbly patio table 4",
    ownerId: "jordan",
    storeId: "downtown-la",
    dueDate: la(-3),
    priority: "low",
    done: false,
  },
  {
    title: "Prepare weekend staff schedule",
    ownerId: "maria",
    storeId: "downtown-la",
    dueDate: la(1),
    priority: "high",
    done: false,
  },
  {
    title: "Change fryer oil",
    ownerId: "theo",
    storeId: "brooklyn",
    dueDate: bk(0),
    priority: "high",
    done: false,
  },
  {
    title: "Order napkins and straws",
    ownerId: "theo",
    storeId: "brooklyn",
    dueDate: bk(3),
    priority: "low",
    done: false,
  },
];

const approvals: Omit<Approval, "id">[] = [
  {
    title: "Replace fryer thermostat",
    details: "Quote from Bay Kitchen Repair: $240",
    requesterId: "sam",
    storeId: "downtown-la",
    status: "pending",
  },
  {
    title: "Extra produce order for Saturday",
    details: "Wedding party of 60",
    requesterId: "jordan",
    storeId: "downtown-la",
    status: "pending",
  },
  {
    title: "Day off on the 24th",
    requesterId: "sam",
    storeId: "downtown-la",
    status: "approved",
    decidedBy: "maria",
    decidedAt: Date.now() - 86_400_000,
  },
  {
    title: "New mop buckets",
    requesterId: "theo",
    storeId: "brooklyn",
    status: "pending",
  },
];

async function upsertAccount(person: (typeof people)[number]) {
  const fields = {
    email: person.email,
    password: DEMO_PASSWORD,
    displayName: person.name,
  };
  try {
    await auth.updateUser(person.uid, fields);
  } catch {
    await auth.createUser({ uid: person.uid, ...fields });
  }
}

async function main() {
  console.log(
    `Seeding ${useEmulator ? "the local emulators" : "project mise-tasks"}...`,
  );

  for (const person of people) await upsertAccount(person);

  // Start from a clean slate so the demo always looks the same.
  await db.recursiveDelete(db.collection("tasks"));
  await db.recursiveDelete(db.collection("approvals"));

  const batch = db.batch();
  for (const { id, ...store } of stores)
    batch.set(db.doc(`stores/${id}`), store);
  for (const { uid, name, role, storeId } of people)
    batch.set(db.doc(`users/${uid}`), { name, role, storeId });
  for (const task of tasks) batch.set(db.collection("tasks").doc(), task);
  for (const approval of approvals)
    batch.set(db.collection("approvals").doc(), approval);
  await batch.commit();

  console.log(
    `Done: ${stores.length} stores, ${people.length} accounts, ${tasks.length} tasks, ${approvals.length} approvals.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
