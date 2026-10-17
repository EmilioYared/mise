# Mise

Tasks and approvals for restaurant teams working across several locations.

> _Mise en place_: everything in its place before service starts.

**Live demo:** [mise-tasks.vercel.app](https://mise-tasks.vercel.app). Sign in with one of the demo buttons:

| Account       | Sees                                           |
| ------------- | ---------------------------------------------- |
| Store manager | The whole Downtown LA store; approves requests |
| Staff member  | Only their own tasks and requests              |

Demo data is reset with `npm run seed`.

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

You need Node 24 and Java 21 (for the Firebase emulators). No Firebase account is needed: everything runs against local emulators with demo data.

```bash
npm install
cp .env.example .env.local          # then set NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true

npm run emulators                   # terminal 1: Auth + Firestore emulators
npm run seed:emulator               # terminal 2: demo stores, accounts, tasks
npm run dev                         # http://localhost:3000
```

Sign in with one of the demo buttons on the sign-in page (`manager@mise.demo` or `staff@mise.demo`, password `mise-demo`).

| Script               |                                                  |
| -------------------- | ------------------------------------------------ |
| `npm run lint`       | ESLint                                           |
| `npm run typecheck`  | Generates Next route types, then `tsc`           |
| `npm test`           | Unit tests                                       |
| `npm run test:rules` | Firestore security rules tests (emulator)        |
| `npm run seed`       | Reset demo data in the real project (admin only) |
| `npm run format`     | Prettier                                         |

## How I work on this repo

Every change starts as an issue, goes on its own branch, and is merged through a pull request once CI passes.
