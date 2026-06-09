import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import {
  clearSchedule,
  deleteLeague,
  generateSchedule,
  getLeagueBySlug,
  loadLeagueContext,
  setLeagueStatus
} from '$lib/server/leagues';
import {
  addPlayer,
  countPlayers,
  removePlayer,
  updatePlayer as savePlayer
} from '$lib/server/players';
import { addMatchesForPlayer, clearMatchResult, recordMatchResult } from '$lib/server/matches';
import { isValidResult, type LeagueStatus } from '$lib/server/scoring';

export const load: PageServerLoad = async ({ params }) => {
  const league = getLeagueBySlug(params.slug);
  if (!league) throw error(404, 'League not found');

  const ctx = loadLeagueContext(league.id, { recentLimit: 10, status: league.status });

  return {
    league,
    players: ctx.players,
    matches: ctx.matches,
    stats: ctx.stats,
    standings: ctx.standings,
    recent: ctx.recent,
    canManageRoster: ctx.canManageRoster,
    playerIdsWithResults: ctx.playerIdsWithResults
  };
};

function requireLeague(slug: string) {
  const league = getLeagueBySlug(slug);
  if (!league) throw error(404, 'League not found');
  return league;
}

function canManageRoster(status: LeagueStatus): boolean {
  return status === 'draft' || status === 'active';
}

export const actions: Actions = {
  addPlayer: async ({ request, params }) => {
    const league = requireLeague(params.slug);
    if (!canManageRoster(league.status)) {
      return fail(400, { error: 'Players can only be added while the league is in draft or active.' });
    }
    const data = await request.formData();
    const name = String(data.get('name') ?? '');
    const factionId = String(data.get('factionId') ?? '');
    try {
      const player = addPlayer(league.id, name, factionId);
      if (league.status === 'active') {
        addMatchesForPlayer(league.id, player.id);
      }
    } catch (e: any) {
      return fail(400, { error: e?.message ?? 'Failed to add player.' });
    }
    return { success: true };
  },

  updatePlayer: async ({ request, params }) => {
    const league = requireLeague(params.slug);
    if (!canManageRoster(league.status)) {
      return fail(400, {
        error: 'Players can only be edited while the league is in draft or active.'
      });
    }
    const data = await request.formData();
    const playerId = Number(data.get('playerId'));
    const name = String(data.get('name') ?? '');
    const factionId = String(data.get('factionId') ?? '');
    if (!Number.isFinite(playerId)) return fail(400, { error: 'Invalid player.' });
    try {
      savePlayer(league.id, playerId, name, factionId);
    } catch (e: any) {
      return fail(400, { error: e?.message ?? 'Failed to update player.' });
    }
    return { success: true };
  },

  removePlayer: async ({ request, params }) => {
    const league = requireLeague(params.slug);
    if (!canManageRoster(league.status)) {
      return fail(400, {
        error: 'Players can only be removed while the league is in draft or active.'
      });
    }
    const data = await request.formData();
    const playerId = Number(data.get('playerId'));
    if (!Number.isFinite(playerId)) return fail(400, { error: 'Invalid player.' });
    if (league.status === 'active' && countPlayers(league.id) <= 2) {
      return fail(400, { error: 'An active league must keep at least 2 players.' });
    }
    try {
      removePlayer(league.id, playerId);
    } catch (e: any) {
      return fail(400, { error: e?.message ?? 'Failed to remove player.' });
    }
    return { success: true };
  },

  startLeague: async ({ params }) => {
    const league = requireLeague(params.slug);
    if (league.status !== 'draft') {
      return fail(400, { error: 'League has already started.' });
    }
    try {
      generateSchedule(league.id);
      setLeagueStatus(league.id, 'active');
    } catch (e: any) {
      return fail(400, { error: e?.message ?? 'Failed to start league.' });
    }
    return { success: true };
  },

  reopen: async ({ params }) => {
    const league = requireLeague(params.slug);
    if (league.status !== 'finished') {
      return fail(400, { error: 'Only finished leagues can be reopened.' });
    }
    setLeagueStatus(league.id, 'active');
    return { success: true };
  },

  finish: async ({ params }) => {
    const league = requireLeague(params.slug);
    if (league.status !== 'active') {
      return fail(400, { error: 'Only active leagues can be finished.' });
    }
    setLeagueStatus(league.id, 'finished');
    return { success: true };
  },

  resetSchedule: async ({ params }) => {
    const league = requireLeague(params.slug);
    clearSchedule(league.id);
    setLeagueStatus(league.id, 'draft');
    return { success: true };
  },

  recordResult: async ({ request, params }) => {
    const league = requireLeague(params.slug);
    if (league.status === 'draft') {
      return fail(400, { error: 'Generate the schedule before recording results.' });
    }
    const data = await request.formData();
    const matchId = Number(data.get('matchId'));
    const result = String(data.get('result') ?? '');
    if (!Number.isFinite(matchId)) return fail(400, { error: 'Invalid match.' });
    if (!isValidResult(result)) return fail(400, { error: 'Invalid result.' });
    try {
      recordMatchResult(league.id, matchId, result);
    } catch (e: any) {
      return fail(400, { error: e?.message ?? 'Failed to record result.' });
    }
    return { success: true };
  },

  clearResult: async ({ request, params }) => {
    const league = requireLeague(params.slug);
    const data = await request.formData();
    const matchId = Number(data.get('matchId'));
    if (!Number.isFinite(matchId)) return fail(400, { error: 'Invalid match.' });
    clearMatchResult(league.id, matchId);
    return { success: true };
  },

  delete: async ({ params }) => {
    const league = requireLeague(params.slug);
    deleteLeague(league.id);
    throw redirect(303, '/admin');
  }
};
