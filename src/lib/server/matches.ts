import { sqlite } from '$lib/server/db';
import { isValidResult, type MatchResult } from '$lib/server/scoring';

export type Match = {
  id: number;
  leagueId: number;
  playerAId: number;
  playerBId: number;
  result: MatchResult | null;
  recordedAt: number | null;
};

export type MatchWithNames = Match & {
  playerAName: string;
  playerBName: string;
  playerAFactionId: string;
  playerBFactionId: string;
};

export type OpenMatchOpponent = { id: number; name: string; factionId: string };

export type OpenMatchesPerPlayerRow = {
  playerId: number;
  playerName: string;
  factionId: string;
  opponents: OpenMatchOpponent[];
};

const MATCH_WITH_NAMES_SELECT = `
  select m.id,
         m.league_id  as leagueId,
         m.player_a_id as playerAId,
         m.player_b_id as playerBId,
         m.result,
         m.recorded_at as recordedAt,
         pa.name as playerAName,
         pb.name as playerBName,
         pa.faction_id as playerAFactionId,
         pb.faction_id as playerBFactionId
    from matches m
    join players pa on pa.id = m.player_a_id
    join players pb on pb.id = m.player_b_id`;

/**
 * Generate unordered pairs (i, j) with i < j for a round-robin where every
 * player plays every other player once.
 */
export function generatePairs<T extends { id: number }>(
  items: T[]
): { aId: number; bId: number }[] {
  const out: { aId: number; bId: number }[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      const aId = Math.min(a.id, b.id);
      const bId = Math.max(a.id, b.id);
      out.push({ aId, bId });
    }
  }
  return out;
}

export function listMatches(leagueId: number): MatchWithNames[] {
  return sqlite
    .prepare(
      `${MATCH_WITH_NAMES_SELECT}
        where m.league_id = ?
        order by m.id asc`
    )
    .all(leagueId) as MatchWithNames[];
}

export function listRecentResults(leagueId: number, limit = 10): MatchWithNames[] {
  return sqlite
    .prepare(
      `${MATCH_WITH_NAMES_SELECT}
        where m.league_id = ? and m.result is not null
        order by m.recorded_at desc, m.id desc
        limit ?`
    )
    .all(leagueId, limit) as MatchWithNames[];
}

export function matchStats(matches: MatchWithNames[]): { total: number; completed: number } {
  let completed = 0;
  for (const m of matches) {
    if (m.result !== null) completed += 1;
  }
  return { total: matches.length, completed };
}

export function recentResultsFromMatches(matches: MatchWithNames[], limit: number): MatchWithNames[] {
  return matches
    .filter((m) => m.result !== null)
    .sort((a, b) => {
      const at = a.recordedAt ?? 0;
      const bt = b.recordedAt ?? 0;
      if (bt !== at) return bt - at;
      return b.id - a.id;
    })
    .slice(0, limit);
}

export function playerIdsWithResults(matches: MatchWithNames[]): number[] {
  const ids = new Set<number>();
  for (const m of matches) {
    if (m.result === null) continue;
    ids.add(m.playerAId);
    ids.add(m.playerBId);
  }
  return [...ids];
}

export function openMatchesPerPlayer(
  players: { id: number; name: string; factionId: string }[],
  matches: MatchWithNames[]
): OpenMatchesPerPlayerRow[] {
  type Opponent = OpenMatchOpponent;
  const openByPlayer = new Map<number, Opponent[]>();
  for (const p of players) openByPlayer.set(p.id, []);
  for (const m of matches) {
    if (m.result !== null) continue;
    openByPlayer.get(m.playerAId)?.push({
      id: m.playerBId,
      name: m.playerBName,
      factionId: m.playerBFactionId
    });
    openByPlayer.get(m.playerBId)?.push({
      id: m.playerAId,
      name: m.playerAName,
      factionId: m.playerAFactionId
    });
  }
  return players
    .map((p) => ({
      playerId: p.id,
      playerName: p.name,
      factionId: p.factionId,
      opponents: (openByPlayer.get(p.id) ?? []).sort((a, b) => a.name.localeCompare(b.name))
    }))
    .sort((a, b) => a.playerName.localeCompare(b.playerName));
}

export function recordMatchResult(
  leagueId: number,
  matchId: number,
  result: MatchResult
): void {
  if (!isValidResult(result)) throw new Error('Invalid result.');
  const info = sqlite
    .prepare(
      "update matches set result = ?, recorded_at = (unixepoch('subsec') * 1000) where id = ? and league_id = ?"
    )
    .run(result, matchId, leagueId);
  if (info.changes === 0) {
    throw new Error('Match not found.');
  }
}

export function clearMatchResult(leagueId: number, matchId: number): void {
  sqlite
    .prepare('update matches set result = null, recorded_at = null where id = ? and league_id = ?')
    .run(matchId, leagueId);
}

/**
 * After adding a player to an active league, insert open matches vs every other player.
 * Skips pairs that already exist. Returns how many rows were inserted.
 */
export function addMatchesForPlayer(leagueId: number, playerId: number): number {
  const others = sqlite
    .prepare('select id from players where league_id = ? and id != ? order by id asc')
    .all(leagueId, playerId) as { id: number }[];

  if (others.length === 0) return 0;

  const pairs = generatePairs([{ id: playerId }, ...others]).filter(
    (p) => p.aId === playerId || p.bId === playerId
  );

  const insert = sqlite.prepare(
    'insert or ignore into matches (league_id, player_a_id, player_b_id) values (?, ?, ?)'
  );

  let inserted = 0;
  const tx = sqlite.transaction(() => {
    for (const p of pairs) {
      const info = insert.run(leagueId, p.aId, p.bId);
      inserted += info.changes;
    }
  });
  tx();
  return inserted;
}

export function countMatches(leagueId: number): { total: number; completed: number } {
  const row = sqlite
    .prepare(
      'select count(1) as total, sum(case when result is not null then 1 else 0 end) as completed from matches where league_id = ?'
    )
    .get(leagueId) as { total: number; completed: number | null };
  return { total: row.total, completed: row.completed ?? 0 };
}
