import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const tmpFiles: string[] = [];

function useTempDb() {
  const dbPath = path.join(os.tmpdir(), `league-test-${randomUUID()}.db`);
  tmpFiles.push(dbPath);
  process.env.DB_PATH = dbPath;
  vi.resetModules();
  return dbPath;
}

afterEach(() => {
  for (const f of tmpFiles.splice(0)) {
    try {
      fs.unlinkSync(f);
    } catch {
      /* ignore */
    }
  }
});

describe('loadLeagueContext', () => {
  beforeEach(() => {
    useTempDb();
  });

  it('loads players, matches, standings, and recent results in one pass', async () => {
    const { createLeague, generateSchedule, loadLeagueContext, setLeagueStatus } = await import(
      './leagues'
    );
    const { addPlayer } = await import('./players');
    const { recordMatchResult } = await import('./matches');

    const league = createLeague({ name: 'Test', slug: `t-${randomUUID().slice(0, 8)}` });
    const alice = addPlayer(league.id, 'Alice', 'stormcast-eternals');
    const bob = addPlayer(league.id, 'Bob', 'skaven');
    generateSchedule(league.id);
    setLeagueStatus(league.id, 'active');
    recordMatchResult(league.id, 1, 'a');

    const ctx = loadLeagueContext(league.id, { recentLimit: 5, status: 'active' });

    expect(ctx.players).toHaveLength(2);
    expect(ctx.matches).toHaveLength(1);
    expect(ctx.stats).toEqual({ total: 1, completed: 1 });
    expect(ctx.recent).toHaveLength(1);
    expect(ctx.standings[0]).toMatchObject({
      playerId: alice.id,
      playerName: 'Alice',
      wins: 1,
      points: 1
    });
    expect(ctx.canManageRoster).toBe(true);
    expect(ctx.playerIdsWithResults).toEqual(expect.arrayContaining([alice.id, bob.id]));
  });
});
