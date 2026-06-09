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

describe('addMatchesForPlayer', () => {
  beforeEach(() => {
    useTempDb();
  });

  it('inserts one open match per existing player', async () => {
    const { createLeague, generateSchedule, setLeagueStatus } = await import('./leagues');
    const { addPlayer } = await import('./players');
    const { addMatchesForPlayer, countMatches } = await import('./matches');

    const league = createLeague({ name: 'Test', slug: `t-${randomUUID().slice(0, 8)}` });
    addPlayer(league.id, 'Alice', 'stormcast-eternals');
    addPlayer(league.id, 'Bob', 'skaven');
    addPlayer(league.id, 'Carol', 'sylvaneth');
    generateSchedule(league.id);
    setLeagueStatus(league.id, 'active');

    const before = countMatches(league.id);
    expect(before.total).toBe(3);

    const dave = addPlayer(league.id, 'Dave', 'seraphon');
    const inserted = addMatchesForPlayer(league.id, dave.id);

    expect(inserted).toBe(3);
    const after = countMatches(league.id);
    expect(after.total).toBe(6);
  });

  it('is idempotent when called again', async () => {
    const { createLeague, generateSchedule } = await import('./leagues');
    const { addPlayer } = await import('./players');
    const { addMatchesForPlayer } = await import('./matches');

    const league = createLeague({ name: 'Test', slug: `t-${randomUUID().slice(0, 8)}` });
    addPlayer(league.id, 'Alice', 'stormcast-eternals');
    addPlayer(league.id, 'Bob', 'skaven');
    generateSchedule(league.id);

    const carol = addPlayer(league.id, 'Carol', 'sylvaneth');
    expect(addMatchesForPlayer(league.id, carol.id)).toBe(2);
    expect(addMatchesForPlayer(league.id, carol.id)).toBe(0);
  });
});

describe('playerHasRecordedResults', () => {
  beforeEach(() => {
    useTempDb();
  });

  it('returns true when the player has a recorded match', async () => {
    const { createLeague, generateSchedule, setLeagueStatus } = await import('./leagues');
    const { addPlayer, playerHasRecordedResults } = await import('./players');
    const { recordMatchResult } = await import('./matches');

    const league = createLeague({ name: 'Test', slug: `t-${randomUUID().slice(0, 8)}` });
    const alice = addPlayer(league.id, 'Alice', 'stormcast-eternals');
    addPlayer(league.id, 'Bob', 'skaven');
    generateSchedule(league.id);
    setLeagueStatus(league.id, 'active');
    recordMatchResult(league.id, 1, 'a');

    expect(playerHasRecordedResults(league.id, alice.id)).toBe(true);
    expect(playerHasRecordedResults(league.id, 999)).toBe(false);
  });
});

describe('updatePlayer', () => {
  beforeEach(() => {
    useTempDb();
  });

  it('rejects invalid faction and duplicate names', async () => {
    const { createLeague } = await import('./leagues');
    const { addPlayer, updatePlayer } = await import('./players');

    const league = createLeague({ name: 'Test', slug: `t-${randomUUID().slice(0, 8)}` });
    const a = addPlayer(league.id, 'Alice', 'stormcast-eternals');
    addPlayer(league.id, 'Bob', 'skaven');

    expect(() => updatePlayer(league.id, a.id, 'Alice', 'not-a-faction')).toThrow(
      /valid Spearhead faction/
    );
    expect(() => updatePlayer(league.id, a.id, 'Bob', 'stormcast-eternals')).toThrow(
      /already exists/
    );
  });
});
