# Ethio Matric Prep

An exam-prep web app for Ethiopian Grade 12 students preparing for the National
Matric Examination: subject practice questions, mock exams, progress tracking,
bookmarks, a study planner, and a membership/paywall for premium question sets.

Originally exported from Google AI Studio, then extended with a full
Express + SQLite/PostgreSQL backend.

## Stack

- **Frontend**: React 19 + Vite 6 + Tailwind CSS 4, React Router, Framer
  Motion (`motion`), Recharts, Lucide icons.
- **Backend**: Express (TypeScript, run via `tsx`), mounted at `/api`.
  In dev, Vite runs as Express middleware, so one process (`server.ts`)
  serves both the API and the frontend.
- **Database**: PostgreSQL if `DB_HOST`/`DB_NAME` are set, otherwise falls
  back automatically to a local SQLite file at
  `backend/database/ethio_matric.db` (auto-bootstrapped from
  `backend/database/schema.sql` + `seed.sql`). No `DB_HOST` is configured
  here, so it's running on SQLite.
- **Auth**: Email/password (bcrypt + JWT) and Google Sign-In (Google
  Identity Services on the client, `google-auth-library` verifying the ID
  token on the server — no OAuth client secret needed).

## Running it

- Workflow **"Start application"** runs `npm run dev` (tsx server.ts) on
  port 5000 — this is what the Replit preview shows.
- `npm run build` — Vite build + esbuild bundle of the server into
  `dist/server.cjs`.
- `npm start` — runs the production build.
- `npm run lint` — `tsc --noEmit` type check.

## Environment variables

Configured as shared Replit env vars:
- `JWT_SECRET` — generated automatically for this repl (signs auth tokens).
- `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` — Google OAuth Web Client ID
  (same value in both), provided by the user. Server verifies the ID token
  audience against `GOOGLE_CLIENT_ID`; the client uses
  `VITE_GOOGLE_CLIENT_ID` to render the Google Identity Services button.
  **The Google Cloud OAuth client's "Authorized JavaScript origins" must
  include the current Replit dev domain (and the published domain, once
  deployed) or Google Sign-In will fail.**

Not configured (optional, app runs fine without them):
- `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` — only
  needed to use PostgreSQL instead of the SQLite fallback.
- `GEMINI_API_KEY` — left over from the AI Studio template; unused by the
  current codebase.

## Notes / fixes made during import setup

- Added `allowedHosts: true` to `vite.config.ts` — required so Replit's
  proxied preview (dynamic subdomain) can reach the Vite dev middleware.
- Changed the server's default port from 3002 to 5000 to match Replit's
  webview convention (still overridable via `PORT`).
- Fixed pre-existing TypeScript errors: `HomePage.tsx` called an
  undefined `setActivePage` in four places (now uses `navigate(...)` from
  `react-router-dom`, matching the rest of the app's routing), and two
  type errors in `backend/utils/googleAuth.ts`.

## User preferences

None recorded yet.
