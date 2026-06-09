import { sqlite } from '$lib/server/db';
import {
  generatePairs,
  listMatches,
  matchStats,
  playerIdsWithResults,
  recentResultsFromMatches,
  type MatchWithNames
} from '$lib/server/matches';
import { listPlayers, type Player } from '$lib/server/players';
import { buildStandings, type StandingsRow } from '$lib/server/standings';
import { isValidLeagueStatus, type LeagueStatus } from '$lib/server/scoring';
import { isValidSlug, slugify } from '$lib/server/slug';

export type LeagueContext = {
  players: Player[];
  matches: MatchWithNames[];
  standings: StandingsRow[];
  recent: MatchWithNames[];
  stats: { total: number; completed: number };
  canManageRoster: boolean;
  playerIdsWithResults: number[];
};

export function loadLeagueContext(
  leagueId: number,
  options?: { recentLimit?: number; status?: LeagueStatus }
): LeagueContext {
  const players = listPlayers(leagueId);
  const matches = listMatches(leagueId);
  const standings = buildStandings(
    players.map((p) => ({ id: p.id, name: p.name, factionId: p.factionId })),
    matches.map((m) => ({
      playerAId: m.playerAId,
      playerBId: m.playerBId,
      result: m.result
    }))
  );
  const recentLimit = options?.recentLimit ?? 10;
  const recent = recentResultsFromMatches(matches, recentLimit);
  const stats = matchStats(matches);
  const leagueStatus = options?.status ?? 'draft';
  return {
    players,
    matches,
    standings,
    recent,
    stats,
    canManageRoster: leagueStatus === 'draft' || leagueStatus === 'active',
    playerIdsWithResults: playerIdsWithResults(matches)
  };
}

export type League = {
  id: number;
  slug: string;
  name: string;
  status: LeagueStatus;
  createdAt: number;
  updatedAt: number;
};

export type LeagueWithStats = League & {
  playerCount: number;
  matchTotal: number;
  matchCompleted: number;
};

export function listLeagues(): LeagueWithStats[] {
  return sqlite
    .prepare(
      `select l.id,
              l.slug,
              l.name,
              l.status,
              l.created_at as createdAt,
              l.updated_at as updatedAt,
              (select count(1) from players p where p.league_id = l.id) as playerCount,
              (select count(1) from matches m where m.league_id = l.id) as matchTotal,
              (select count(1) from matches m where m.league_id = l.id and m.result is not null) as matchCompleted
         from leagues l
        order by l.created_at desc`
    )
    .all() as LeagueWithStats[];
}

export function listPublicLeagues(): LeagueWithStats[] {
  return listLeagues().filter((l) => l.status === 'active' || l.status === 'finished');
}

export function getLeagueBySlug(slug: string): League | undefined {
  return sqlite
    .prepare(
      `select id, slug, name, status, created_at as createdAt, updated_at as updatedAt
         from leagues where slug = ?`
    )
    .get(slug) as League | undefined;
}

function getLeagueById(id: number): League | undefined {
  return sqlite
    .prepare(
      `select id, slug, name, status, created_at as createdAt, updated_at as updatedAt
         from leagues where id = ?`
    )
    .get(id) as League | undefined;
}

export function createLeague(input: { name: string; slug?: string }): League {
  const name = input.name.trim();
  if (!name) throw new Error('League name is required.');
  if (name.length > 120) throw new Error('League name is too long (max 120 chars).');

  let slug = (input.slug ?? '').trim().toLowerCase();
  if (!slug) slug = slugify(name);
  else slug = slugify(slug);

  if (!isValidSlug(slug)) {
    throw new Error('Slug must be lowercase alphanumeric with single dashes.');
  }

  try {
    const info = sqlite
      .prepare('insert into leagues (slug, name) values (?, ?)')
      .run(slug, name);
    return getLeagueById(Number(info.lastInsertRowid))!;
  } catch (e: any) {
    if (String(e?.message ?? '').includes('UNIQUE')) {
      throw new Error('A league with that slug already exists.', { cause: e });
    }
    throw e;
  }
}

function touchLeague(leagueId: number) {
  sqlite
    .prepare("update leagues set updated_at = (unixepoch('subsec') * 1000) where id = ?")
    .run(leagueId);
}

export function setLeagueStatus(leagueId: number, status: LeagueStatus): void {
  if (!isValidLeagueStatus(status)) throw new Error('Invalid status.');
  sqlite.prepare('update leagues set status = ? where id = ?').run(status, leagueId);
  touchLeague(leagueId);
}

export function clearSchedule(leagueId: number): void {
  sqlite.prepare('delete from matches where league_id = ?').run(leagueId);
  touchLeague(leagueId);
}

/**
 * Round-robin: insert one open match per unordered pair. Idempotent enough to
 * be re-run only if there are no existing matches.
 */
export function generateSchedule(leagueId: number): { inserted: number } {
  const existing = sqlite
    .prepare('select count(1) as c from matches where league_id = ?')
    .get(leagueId) as { c: number };
  if (existing.c > 0) {
    throw new Error('Schedule already generated. Clear it first to regenerate.');
  }

  const players = sqlite
    .prepare('select id from players where league_id = ? order by id asc')
    .all(leagueId) as { id: number }[];

  if (players.length < 2) {
    throw new Error('Add at least 2 players before generating the schedule.');
  }

  const pairs = generatePairs(players);
  const insert = sqlite.prepare(
    'insert into matches (league_id, player_a_id, player_b_id) values (?, ?, ?)'
  );
  const tx = sqlite.transaction(() => {
    for (const p of pairs) {
      insert.run(leagueId, p.aId, p.bId);
    }
  });
  tx();
  touchLeague(leagueId);
  return { inserted: pairs.length };
}

export function deleteLeague(leagueId: number): void {
  sqlite.prepare('delete from leagues where id = ?').run(leagueId);
}
