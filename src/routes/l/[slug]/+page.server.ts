import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { RECENT_RESULTS_MAX, RECENT_RESULTS_STEP } from '$lib/constants';
import { getLeagueBySlug, loadLeagueContext } from '$lib/server/leagues';
import { openMatchesPerPlayer } from '$lib/server/matches';
import { playersOnFire } from '$lib/server/streaks';

export const load: PageServerLoad = async ({ params, url }) => {
  const league = getLeagueBySlug(params.slug);
  if (!league) throw error(404, 'League not found');
  if (league.status === 'draft') throw error(404, 'League not yet started');

  const recentLimit = Math.min(
    Math.max(Number(url.searchParams.get('recent') || RECENT_RESULTS_STEP), RECENT_RESULTS_STEP),
    RECENT_RESULTS_MAX
  );
  const ctx = loadLeagueContext(league.id, { recentLimit, status: league.status });
  const openMatchesPerPlayerRows = openMatchesPerPlayer(ctx.players, ctx.matches);
  const onFirePlayerIds = playersOnFire(
    ctx.players.map((p) => p.id),
    ctx.matches
  );

  return {
    league,
    standings: ctx.standings,
    recent: ctx.recent,
    recentLimit,
    stats: ctx.stats,
    openMatchesPerPlayer: openMatchesPerPlayerRows,
    onFirePlayerIds
  };
};
