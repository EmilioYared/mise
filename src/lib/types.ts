export type Role = "manager" | "staff";
export type Priority = "low" | "medium" | "high";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Store {
  id: string;
  name: string;
  /** IANA time zone, e.g. "America/Los_Angeles". Overdue status uses this. */
  timeZone: string;
}

/** Written only by the server (see firestore.rules), so role is trusted. */
export interface UserProfile {
  uid: string;
  name: string;
  role: Role;
  storeId: string;
}

export interface Task {
  id: string;
  title: string;
  ownerId: string;
  storeId: string;
  /** "YYYY-MM-DD", a calendar date in the store's time zone. */
  dueDate: string;
  priority: Priority;
  done: boolean;
}

export interface Approval {
  id: string;
  title: string;
  details?: string;
  requesterId: string;
  storeId: string;
  status: ApprovalStatus;
  decidedBy?: string;
  decidedAt?: number;
}
