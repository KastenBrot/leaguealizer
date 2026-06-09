# league

A simple league management tool. Admins create leagues, add players, generate
a round-robin schedule, and record match results. While a league is **active**,
admins can add, edit, or remove players; removing a player deletes their
scheduled matches and any recorded results. Each league has a public read-only
page with standings and remaining matches.

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

## Production (Hetzner)

League deploys to the same Hetzner VPS as [in-stock](https://github.com/Engines-Stuttgart/in-stock) (lootbox). TLS and the public hostname are handled by **lootbox’s Caddy**; league runs as an app-only container on the shared Docker network `deploy_default`.

**Deploy trigger:** push to `main` (or manual **Deploy** workflow). GitHub Actions builds a Docker image, pushes to GHCR, rsyncs `deploy/` to the server, and runs `remote-deploy.sh`.

**Server paths:**

- App data (SQLite): `/opt/league/data`
- Deploy files: `/opt/league/deploy/`
- Env file (auto-managed): `/opt/league/.env`

**First visit after deploy:** open `https://3hard.de/setup` to create the first admin user (see [First run](#first-run)).

### GitHub secrets (league repo)

| Secret | Purpose |
|--------|---------|
| `HETZNER_SSH_PRIVATE_KEY` | SSH key for `root@` the VPS (same as in-stock) |
| `HETZNER_HOST` | Server IP or hostname |

### in-stock repo (shared Caddy)

Set `LEAGUE_DOMAIN` in the **in-stock** repo secrets to `3hard.de`. Deploy **in-stock first** so Caddy picks up the new site block, then deploy league.

### DNS

`3hard.de` A record → Hetzner server IP.

## URLs

- `/` — public list of leagues.
- `/l/<slug>` — public standings and open matches for one league.
- `/login`, `/setup` — admin authentication.
- `/admin` — admin dashboard (after login).

## Spearhead faction icons

Each player has a **Spearhead faction**. Edit **`src/lib/constants.ts`**: each entry in `SPEARHEAD_FACTIONS` has `id`, `name`, and `iconUrl`. Faction SVGs live in `static/spearhead-factions/`. Missing images fall back to `FACTION_ICONS.defaultUrl`, then to initials.

Runemark SVGs are from the [Warcry Card Creator](https://github.com/barrysheppard/warcry-card-creator) project ([CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)). This app is for **personal, non-commercial** use only.
