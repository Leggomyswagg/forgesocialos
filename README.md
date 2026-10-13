# ForgeSocial

React/Vite prototype for social content generation, saved assets, campaign
metrics, and account preferences using Firebase.

Use Node.js 22.18 or newer. Run `npm ci`, then `npm run dev`. Run `npm test`
for the mocked account lifecycle regressions, `npm run lint` for TypeScript
checks, and `npm run build` for the browser build.

The Firebase provider clears every private account collection on sign-out and
account changes. Late profile requests and snapshots from the earlier account
cannot replace the current account state. Events for the same account, including
token refreshes, preserve its loaded collections.

## External verification pending

Google sign-in and Firestore access require a configured Firebase project,
authorized domains, and deployed rules. The mocked tests do not establish live
database isolation. `firestore.rules.test.ts` contains example invariants rather
than an emulator suite and does not verify Firebase rule enforcement.

AI generation requires a configured provider credential. Review the prototype's
client-side AI integration before using a privileged API key in production.
Production deployment and external publishing remain separate work.
