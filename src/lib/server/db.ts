import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const dbPath = process.env.DB_PATH ?? path.resolve('data', 'league.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Sole schema definition — tables and indexes are created here at startup.
sqlite.exec(`
  create table if not exists users (
    id integer primary key autoincrement,
    username text not null unique,
    password_hash text not null,
    created_at integer not null default (unixepoch('subsec') * 1000),
    last_login_at integer
  );

  create table if not exists leagues (
    id integer primary key autoincrement,
    slug text not null unique,
    name text not null,
    status text not null default 'draft',
    created_at integer not null default (unixepoch('subsec') * 1000),
    updated_at integer not null default (unixepoch('subsec') * 1000)
  );

  create table if not exists players (
    id integer primary key autoincrement,
    league_id integer not null references leagues(id) on delete cascade,
    name text not null,
    faction_id text not null,
    created_at integer not null default (unixepoch('subsec') * 1000),
    unique(league_id, name)
  );

  create index if not exists players_league_idx on players(league_id);

  create table if not exists matches (
    id integer primary key autoincrement,
    league_id integer not null references leagues(id) on delete cascade,
    player_a_id integer not null references players(id) on delete cascade,
    player_b_id integer not null references players(id) on delete cascade,
    result text,
    recorded_at integer,
    check (player_a_id < player_b_id),
    check (result is null or result in ('a', 'b', 'draw')),
    unique(league_id, player_a_id, player_b_id)
  );

  create index if not exists matches_league_idx on matches(league_id);
  create index if not exists matches_recorded_idx on matches(league_id, recorded_at);
`);
