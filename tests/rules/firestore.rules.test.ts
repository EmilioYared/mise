import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

// Store 1 (Los Angeles): managerA, staffA, staffB
// Store 2 (New York):    managerB, staffC
let env: RulesTestEnvironment;

const task = {
  title: "Deep clean the walk-in",
  ownerId: "staffA",
  storeId: "store1",
  dueDate: "2026-10-17",
  priority: "high",
  done: false,
};

const approval = {
  title: "Replace fryer thermostat",
  requesterId: "staffA",
  storeId: "store1",
  status: "pending",
  createdAt: 1,
};

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-mise",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "stores/store1"), {
      name: "Downtown LA",
      timeZone: "America/Los_Angeles",
    });
    await setDoc(doc(db, "stores/store2"), {
      name: "Brooklyn",
      timeZone: "America/New_York",
    });
    await setDoc(doc(db, "users/managerA"), {
      role: "manager",
      storeId: "store1",
    });
    await setDoc(doc(db, "users/staffA"), { role: "staff", storeId: "store1" });
    await setDoc(doc(db, "users/staffB"), { role: "staff", storeId: "store1" });
    await setDoc(doc(db, "users/managerB"), {
      role: "manager",
      storeId: "store2",
    });
    await setDoc(doc(db, "users/staffC"), { role: "staff", storeId: "store2" });
    await setDoc(doc(db, "tasks/task1"), task);
    await setDoc(doc(db, "approvals/approval1"), approval);
  });
});

const as = (uid: string) => env.authenticatedContext(uid).firestore();
const anonymous = () => env.unauthenticatedContext().firestore();

describe("tasks", () => {
  it("lets the owner read their task", async () => {
    await assertSucceeds(getDoc(doc(as("staffA"), "tasks/task1")));
  });

  it("does not let another staff member in the same store read it", async () => {
    await assertFails(getDoc(doc(as("staffB"), "tasks/task1")));
  });

  it("lets the store's manager read it", async () => {
    await assertSucceeds(getDoc(doc(as("managerA"), "tasks/task1")));
  });

  it("does not let another store's manager read it", async () => {
    await assertFails(getDoc(doc(as("managerB"), "tasks/task1")));
  });

  it("does not let signed-out users read it", async () => {
    await assertFails(getDoc(doc(anonymous(), "tasks/task1")));
  });

  it("allows a staff member to list only their own tasks", async () => {
    const db = as("staffA");
    await assertSucceeds(
      getDocs(query(collection(db, "tasks"), where("ownerId", "==", "staffA"))),
    );
    await assertFails(
      getDocs(query(collection(db, "tasks"), where("storeId", "==", "store1"))),
    );
  });

  it("allows a manager to list their whole store", async () => {
    await assertSucceeds(
      getDocs(
        query(
          collection(as("managerA"), "tasks"),
          where("storeId", "==", "store1"),
        ),
      ),
    );
  });

  it("lets staff create tasks for themselves but not for others", async () => {
    const db = as("staffB");
    await assertSucceeds(
      setDoc(doc(db, "tasks/new1"), { ...task, ownerId: "staffB" }),
    );
    await assertFails(
      setDoc(doc(db, "tasks/new2"), { ...task, ownerId: "staffA" }),
    );
  });

  it("lets a manager assign tasks only within their own store", async () => {
    await assertSucceeds(
      setDoc(doc(as("managerA"), "tasks/new1"), { ...task, ownerId: "staffB" }),
    );
    await assertFails(
      setDoc(doc(as("managerA"), "tasks/new2"), {
        ...task,
        ownerId: "staffC",
        storeId: "store2",
      }),
    );
  });

  it("rejects an invalid priority", async () => {
    await assertFails(
      setDoc(doc(as("staffA"), "tasks/new1"), { ...task, priority: "urgent" }),
    );
  });

  it("lets the owner update and complete the task", async () => {
    await assertSucceeds(
      updateDoc(doc(as("staffA"), "tasks/task1"), { done: true }),
    );
  });

  it("does not allow handing the task to someone else", async () => {
    await assertFails(
      updateDoc(doc(as("staffA"), "tasks/task1"), { ownerId: "staffB" }),
    );
  });

  it("lets the owner delete it, but not another staff member", async () => {
    await assertFails(deleteDoc(doc(as("staffB"), "tasks/task1")));
    await assertSucceeds(deleteDoc(doc(as("staffA"), "tasks/task1")));
  });
});

describe("users", () => {
  it("lets a manager list their own team, but not another store's", async () => {
    const users = collection(as("managerA"), "users");
    await assertSucceeds(
      getDocs(query(users, where("storeId", "==", "store1"))),
    );
    await assertFails(getDocs(query(users, where("storeId", "==", "store2"))));
  });

  it("does not let staff list their store's team", async () => {
    await assertFails(
      getDocs(
        query(
          collection(as("staffA"), "users"),
          where("storeId", "==", "store1"),
        ),
      ),
    );
  });

  it("lets users read their own profile but not a colleague's", async () => {
    await assertSucceeds(getDoc(doc(as("staffA"), "users/staffA")));
    await assertFails(getDoc(doc(as("staffA"), "users/staffB")));
  });

  it("lets a manager read profiles in their store only", async () => {
    await assertSucceeds(getDoc(doc(as("managerA"), "users/staffA")));
    await assertFails(getDoc(doc(as("managerA"), "users/staffC")));
  });

  it("does not let anyone promote themselves to manager", async () => {
    await assertFails(
      updateDoc(doc(as("staffA"), "users/staffA"), { role: "manager" }),
    );
  });
});

describe("approvals", () => {
  it("lets staff submit a pending request for their own store", async () => {
    await assertSucceeds(
      setDoc(doc(as("staffB"), "approvals/new1"), {
        ...approval,
        requesterId: "staffB",
      }),
    );
  });

  it("does not let staff submit a request that is already approved", async () => {
    await assertFails(
      setDoc(doc(as("staffB"), "approvals/new1"), {
        ...approval,
        requesterId: "staffB",
        status: "approved",
      }),
    );
  });

  it("does not let staff submit a request with a decision filled in", async () => {
    await assertFails(
      setDoc(doc(as("staffB"), "approvals/new1"), {
        ...approval,
        requesterId: "staffB",
        decidedBy: "staffB",
      }),
    );
  });

  it("rejects a request with an empty title", async () => {
    await assertFails(
      setDoc(doc(as("staffB"), "approvals/new1"), {
        ...approval,
        requesterId: "staffB",
        title: "",
      }),
    );
  });

  it("does not let staff submit a request for another store", async () => {
    await assertFails(
      setDoc(doc(as("staffB"), "approvals/new1"), {
        ...approval,
        requesterId: "staffB",
        storeId: "store2",
      }),
    );
  });

  it("lets staff list their own requests and managers their store's", async () => {
    const mine = query(
      collection(as("staffA"), "approvals"),
      where("requesterId", "==", "staffA"),
    );
    await assertSucceeds(getDocs(mine));
    await assertFails(
      getDocs(
        query(
          collection(as("staffA"), "approvals"),
          where("storeId", "==", "store1"),
        ),
      ),
    );
    await assertSucceeds(
      getDocs(
        query(
          collection(as("managerA"), "approvals"),
          where("storeId", "==", "store1"),
        ),
      ),
    );
  });

  it("does not let staff approve their own request", async () => {
    await assertFails(
      updateDoc(doc(as("staffA"), "approvals/approval1"), {
        status: "approved",
        decidedBy: "staffA",
      }),
    );
  });

  it("lets the store's manager approve it, once", async () => {
    const ref = doc(as("managerA"), "approvals/approval1");
    await assertSucceeds(
      updateDoc(ref, {
        status: "approved",
        decidedBy: "managerA",
        decidedAt: 1,
      }),
    );
    await assertFails(
      updateDoc(ref, {
        status: "rejected",
        decidedBy: "managerA",
        decidedAt: 2,
      }),
    );
  });

  it("does not let another store's manager decide", async () => {
    await assertFails(
      updateDoc(doc(as("managerB"), "approvals/approval1"), {
        status: "approved",
        decidedBy: "managerB",
      }),
    );
  });

  it("does not let the manager change anything but the decision", async () => {
    await assertFails(
      updateDoc(doc(as("managerA"), "approvals/approval1"), {
        status: "approved",
        decidedBy: "managerA",
        title: "Something else",
      }),
    );
  });
});
