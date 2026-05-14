# Agent instructions

Guidance for AI assistants and contributors working on this repo.

## Architecture and design

- **Single responsibility** — Keep modules focused: route handlers orchestrate; put data access and domain logic in `$lib/server/*` (e.g. `auth`, `leagues`, `players`, `matches`), not duplicated in pages.
- **Open/closed** — Extend behavior via small functions and clear types; avoid sprawling conditionals when a new case can be a function or table row.
- **Interface segregation** — Export narrow helpers (e.g. `getLeagueBySlug`, `addPlayer`) instead of one giant “do everything” API.
- **Dependency direction** — Server code depends on `db`, schemas, and pure helpers; avoid circular imports; keep scoring/standings logic free of HTTP concerns.
- **DRY** — Reuse existing server functions and validation (`isValidResult`, etc.) before adding parallel code paths.
- **KISS / YAGNI** — Solve the task with the smallest change that fits existing patterns; no speculative features or drive-by refactors.

## Code changes

- Match surrounding style: naming, imports, error handling, and how SvelteKit `load` / `actions` are structured.
- Touch only what the task needs; do not delete unrelated comments or “clean up” unrelated files in the same change.
- Prefer extending existing abstractions over new layers unless the task clearly needs a new boundary.

## Docs and UX

- When behavior, setup, env vars, Docker, scripts, or public URLs change, update **`README.md`** in the same change so it stays accurate.

## Verification

- After non-trivial server or logic changes, run **`pnpm test`** (and `pnpm check` if types or Svelte components are involved).

## Stack (short)

- **SvelteKit** (Svelte 5), **SQLite** via better-sqlite3, **Tailwind** for UI.
- Auth: session cookie + `SESSION_SECRET`; first user via `/setup`, then `/login` for `/admin`.

When in doubt, read nearby files in the same feature area and mirror their approach.
