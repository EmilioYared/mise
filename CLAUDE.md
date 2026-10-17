@AGENTS.md

# Working on Mise

- Next.js keeps pages you navigate away from alive in the background, with their state. Never assume component state resets on navigation; derive it from the data it depends on, or reset it when that data changes.
- Before calling a change done, test the whole journey, including the second time through: sign out and back in, the back button, and switching between the manager and staff accounts.
- Reproduce a bug with a script before fixing it, and rerun the same script to prove the fix.
