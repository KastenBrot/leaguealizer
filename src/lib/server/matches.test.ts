import { describe, expect, it } from 'vitest';
import {
  generatePairs,
  matchStats,
  openMatchesPerPlayer,
  recentResultsFromMatches,
  type MatchWithNames
} from './matches';

describe('generatePairs (round-robin)', () => {
  it('returns no pairs for fewer than 2 players', () => {
    expect(generatePairs([])).toEqual([]);
    expect(generatePairs([{ id: 1 }])).toEqual([]);
  });

  it('returns n*(n-1)/2 unique unordered pairs', () => {
    const players = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
    const pairs = generatePairs(players);
    expect(pairs).toHaveLength((5 * 4) / 2);

    const set = new Set(pairs.map((p) => `${p.aId}-${p.bId}`));
    expect(set.size).toBe(pairs.length);

    for (const p of pairs) {
      expect(p.aId).toBeLessThan(p.bId);
    }
  });

  it('orders ids so the smaller id is always aId', () => {
    const pairs = generatePairs([{ id: 7 }, { id: 3 }, { id: 5 }]);
    for (const p of pairs) {
      expect(p.aId).toBeLessThan(p.bId);
    }
    const set = new Set(pairs.map((p) => `${p.aId}-${p.bId}`));
    expect(set).toEqual(new Set(['3-5', '3-7', '5-7']));
  });
});

function match(
  id: number,
  playerAId: number,
  playerBId: number,
  result: MatchWithNames['result'],
  recordedAt: number | null = null,
  names?: Record<number, { name: string; factionId: string }>
): MatchWithNames {
  const a = names?.[playerAId] ?? { name: `P${playerAId}`, factionId: 'sylvaneth' };
  const b = names?.[playerBId] ?? { name: `P${playerBId}`, factionId: 'skaven' };
  return {
    id,
    leagueId: 1,
    playerAId,
    playerBId,
    result,
    recordedAt,
    playerAName: a.name,
    playerBName: b.name,
    playerAFactionId: a.factionId,
    playerBFactionId: b.factionId
  };
}

describe('openMatchesPerPlayer', () => {
  it('lists open opponents per player sorted by name', () => {
    const players = [
      { id: 1, name: 'Zoe', factionId: 'sylvaneth' },
      { id: 2, name: 'Amy', factionId: 'skaven' },
      { id: 3, name: 'Bob', factionId: 'seraphon' }
    ];
    const names = {
      1: { name: 'Zoe', factionId: 'sylvaneth' },
      2: { name: 'Amy', factionId: 'skaven' },
      3: { name: 'Bob', factionId: 'seraphon' }
    };
    const matches = [
      match(1, 1, 2, null, null, names),
      match(2, 1, 3, 'a', 100, names),
      match(3, 2, 3, null, null, names)
    ];

    const rows = openMatchesPerPlayer(players, matches);
    expect(rows.map((r) => r.playerName)).toEqual(['Amy', 'Bob', 'Zoe']);
    expect(rows.find((r) => r.playerId === 1)?.opponents).toEqual([
      { id: 2, name: 'Amy', factionId: 'skaven' }
    ]);
    expect(rows.find((r) => r.playerId === 2)?.opponents.map((o) => o.name)).toEqual(['Bob', 'Zoe']);
  });
});

describe('recentResultsFromMatches', () => {
  it('returns recorded matches newest first', () => {
    const matches = [
      match(1, 1, 2, 'a', 100),
      match(2, 1, 3, 'b', 300),
      match(3, 2, 3, null, null)
    ];
    const recent = recentResultsFromMatches(matches, 10);
    expect(recent.map((m) => m.id)).toEqual([2, 1]);
  });
});

describe('matchStats', () => {
  it('counts total and completed matches', () => {
    const matches = [match(1, 1, 2, 'a', 1), match(2, 1, 3, null, null)];
    expect(matchStats(matches)).toEqual({ total: 2, completed: 1 });
  });
});
