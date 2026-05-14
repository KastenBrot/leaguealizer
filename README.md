# league

A simple league management tool. Admins create leagues, add players, generate
a round-robin schedule, and record match results. Each league has a public
read-only page with standings and remaining matches.

Scoring: **win = 1, draw = 0.5, loss = 0**.

Design principles and workflow for humans and coding agents: **[AGENTS.md](./AGENTS.md)**.

## First run

- Start the app and open `/setup` to create the **first admin user**.
- After at least one user exists, `/setup` is disabled and you'll use `/login`.

## Local dev

1. Install Node.js 22+ (includes Corepack).
2. Copy `.env.example` to `.env` and set `SESSION_SECRET` (min 16 chars).
3. Install deps and run:

```bash
corepack enable
pnpm install
pnpm dev
```

## Docker

```bash
docker compose up --build
```

Data persists in `./data` (SQLite database).

## URLs

- `/` — public list of leagues.
- `/l/<slug>` — public standings and open matches for one league.
- `/login`, `/setup` — admin authentication.
- `/admin` — admin dashboard (after login).
