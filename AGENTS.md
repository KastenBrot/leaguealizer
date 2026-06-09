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

## Hetzner Cloud deployment notes

- **Shared Caddy**: TLS terminates on lootbox’s Caddy (`/opt/lootbox/deploy/Caddyfile`). League has no Caddy service; it joins Docker network `deploy_default` so Caddy can `reverse_proxy league:3000`.
- **Firewall (Hetzner)**: allow inbound **TCP 80/443** from `0.0.0.0/0` (and `::/0` if using IPv6). Restrict **TCP 22** to your admin IP(s).
- **Key paths on server**:
  - Compose: `/opt/league/deploy/docker-compose.prod.yml`
  - Env file (created/updated by deploy): `/opt/league/.env`
  - Persistent data: `/opt/league/data` (mounted into container at `/app/data`)
- **Common failure modes**:
  - League container can’t start: external network `deploy_default` missing — lootbox stack must be running first (`docker network ls`).
  - 502 from league subdomain: league container not on `deploy_default`, or league service not up.
  - “Cross-site POST form submissions are forbidden”: SvelteKit CSRF origin check; ensure Caddy forwards `Host`/scheme correctly (lootbox Caddyfile already sets `X-Forwarded-*` headers).
