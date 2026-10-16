# Mise

Tasks and approvals for restaurant teams working across several locations.

> _Mise en place_: everything in its place before service starts.

**Status:** in progress. See the [open issues](https://github.com/EmilioYared/mise/issues) for what's being built next.

## What it does

- **Tasks** for each staff member, with priority and due dates. Overdue status is worked out in the store's own time zone.
- **Approvals**: staff send requests (supplies, repairs, time off) and their manager approves or rejects them.
- **Roles**: managers see their whole store; staff see only their own tasks. This is enforced by Firestore security rules, not just hidden in the UI.

## Stack

|               |                                                       |
| ------------- | ----------------------------------------------------- |
| App           | Next.js (App Router), React, TypeScript (strict)      |
| Data and auth | Firebase Auth, Cloud Firestore                        |
| Styling       | Tailwind CSS                                          |
| Tests         | Vitest (unit), Firestore emulator (security rules)    |
| CI            | GitHub Actions: format, lint, typecheck, tests, build |
| Hosting       | Vercel                                                |

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              |                                        |
| ------------------- | -------------------------------------- |
| `npm run lint`      | ESLint                                 |
| `npm run typecheck` | Generates Next route types, then `tsc` |
| `npm test`          | Unit tests                             |
| `npm run format`    | Prettier                               |

## How I work on this repo

Every change starts as an issue, goes on its own branch, and is merged through a pull request once CI passes.
