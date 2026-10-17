// Public demo accounts, shown on the sign-in page so reviewers can try the
// app without signing up. The data they can reach is demo data only.
export const DEMO_PASSWORD = "mise-demo";

export const DEMO_ACCOUNTS = {
  manager: { email: "manager@mise.demo", label: "Store manager" },
  staff: { email: "staff@mise.demo", label: "Staff member" },
} as const;
