<script lang="ts">
  import FactionMark from '$lib/components/FactionMark.svelte';
  import FireComet from '$lib/components/FireComet.svelte';
  import { RECENT_RESULTS_STEP } from '$lib/constants';
  import { fmtPoints, podiumRankLabel, publicResultLabel, statusBadgeClass, statusLabel } from '$lib/ui';
  import type { PageData } from './$types';

  export let data: PageData;

  $: league = data.league;
  $: standings = data.standings;
  $: recent = data.recent;
  $: recentLimit = data.recentLimit;
  $: stats = data.stats;
  $: openMatchesPerPlayer = data.openMatchesPerPlayer;
  $: onFirePlayerIds = new Set<number>(data.onFirePlayerIds ?? []);
  $: hasMoreRecent = recent.length < stats.completed;
  $: nextRecentLimit = recentLimit + RECENT_RESULTS_STEP;

  $: maxPoints = standings.length
    ? Math.max(...standings.map((row: { points: number }) => row.points))
    : 0;

  function barWidthPercent(points: number): string {
    if (maxPoints <= 0 || points <= 0) return '0%';
    return `${(points / maxPoints) * 100}%`;
  }

  function barFillClass(index: number): string {
    if (index === 0) {
      return 'bg-gradient-to-r from-amber-400/55 via-amber-500/40 to-amber-700/50 shadow-sm shadow-amber-500/20';
    }
    if (index === 1) {
      return 'bg-gradient-to-r from-slate-200/45 via-zinc-300/30 to-slate-500/35 shadow-sm shadow-slate-400/15';
    }
    if (index === 2) {
      return 'bg-gradient-to-r from-orange-500/45 via-amber-700/35 to-orange-900/40 shadow-sm shadow-orange-800/15';
    }
    return 'bg-gradient-to-r from-teal-600/35 to-teal-800/45';
  }

  const headerBtnClass =
    'inline-flex items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-950/50 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900/60';
</script>

<main class="relative z-10 min-h-dvh text-zinc-50">
  <div class="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-12">
    <header class="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-xl shadow-black/25 ring-1 ring-inset ring-white/5 backdrop-blur-md sm:p-8">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400/90">League</p>
          <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">{league.name}</h1>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-500">
            <span class={`rounded-full border px-2.5 py-1 font-medium uppercase tracking-wide ${statusBadgeClass(league.status)}`}>
              {statusLabel(league.status)}
            </span>
            <span class="hidden sm:inline text-zinc-700">|</span>
            <span class="tabular-nums">{stats.completed}/{stats.total} matches played</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 self-start">
          {#if data.user}
            <a
              class="text-sm text-teal-400/90 underline-offset-4 hover:text-teal-300 hover:underline"
              href="/admin/leagues/{league.slug}"
            >
              Edit league
            </a>
          {/if}
          <a class={headerBtnClass} href="/">
            <span aria-hidden="true" class="text-zinc-500">←</span>
            All leagues
          </a>
        </div>
      </div>
    </header>

    {#if standings.length > 0}
      <section class="rounded-2xl border border-zinc-800/80 bg-zinc-900/35 p-5 shadow-lg shadow-black/20 ring-1 ring-inset ring-white/5 backdrop-blur-md sm:p-6">
        <div class="mb-5">
          <h2 class="text-sm font-semibold text-zinc-100">Points</h2>
          <p class="mt-1 text-xs text-zinc-500">Expand standings below for W/D/L.</p>
        </div>
        <ul class="space-y-3">
          {#each standings as row, i (row.playerId)}
            {@const onFire = onFirePlayerIds.has(row.playerId)}
            <li class="flex items-center gap-3">
              <span class="w-14 shrink-0 text-right text-xs tabular-nums text-zinc-500">
                {#if i < 3}
                  <span class="block text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                    {#if i < 2}
                      {podiumRankLabel((i + 1) as 1 | 2)}
                    {:else}
                      &nbsp;
                    {/if}
                  </span>
                {/if}
                {i + 1}
              </span>
              <FactionMark factionId={row.factionId} sizeClass="h-8 w-8 shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="mb-0 flex items-baseline justify-between gap-2">
                  <span class="truncate text-sm font-medium text-zinc-100">{row.playerName}</span>
                  <span class="shrink-0 text-sm font-semibold tabular-nums text-zinc-50">{fmtPoints(row.points)}</span>
                </div>
                {#if row.points > 0}
                  <div
                    class="relative inline-block max-w-full overflow-visible pr-1"
                    style={`width: ${barWidthPercent(row.points)}`}
                  >
                    <div class={`h-2.5 rounded-none ${barFillClass(i)}`}></div>
                    {#if onFire}
                      <FireComet />
                    {/if}
                  </div>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <section class="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/35 shadow-lg shadow-black/20 ring-1 ring-inset ring-white/5 backdrop-blur-md">
      <details class="group">
        <summary class="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-zinc-800/80 bg-zinc-950/30 px-5 py-4 transition hover:bg-zinc-800/25 sm:px-6 [&::-webkit-details-marker]:hidden">
          <div>
            <h2 class="text-sm font-semibold text-zinc-100">Standings</h2>
            <p class="mt-1 text-xs text-zinc-500">Win = 1, draw = 0.5, loss = 0.</p>
          </div>
          <span
            aria-hidden="true"
            class="shrink-0 text-zinc-500 transition group-open:rotate-180"
          >▼</span>
        </summary>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <tr class="border-b border-zinc-800/80">
                <th class="px-5 py-3 sm:px-6">#</th>
                <th class="px-5 py-3 sm:px-6">Player</th>
                <th class="px-5 py-3 text-right sm:px-6">P</th>
                <th class="px-5 py-3 text-right sm:px-6">W</th>
                <th class="px-5 py-3 text-right sm:px-6">D</th>
                <th class="px-5 py-3 text-right sm:px-6">L</th>
                <th class="px-5 py-3 text-right sm:px-6">Pts</th>
              </tr>
            </thead>
            <tbody>
              {#each standings as row, i (row.playerId)}
                <tr
                  class={`border-b border-zinc-800/50 transition hover:bg-zinc-800/25 ${i === 0 ? 'bg-teal-950/15' : i % 2 === 1 ? 'bg-zinc-950/20' : ''}`}
                >
                  <td class="px-5 py-3 tabular-nums text-zinc-500 sm:px-6">{i + 1}</td>
                  <td class="px-5 py-3 sm:px-6">
                    <div class="flex items-center gap-2">
                      <FactionMark factionId={row.factionId} sizeClass="h-8 w-8" />
                      <span class="font-medium text-zinc-100">{row.playerName}</span>
                    </div>
                  </td>
                  <td class="px-5 py-3 text-right font-mono text-zinc-400 sm:px-6">{row.played}</td>
                  <td class="px-5 py-3 text-right font-mono text-zinc-400 sm:px-6">{row.wins}</td>
                  <td class="px-5 py-3 text-right font-mono text-zinc-400 sm:px-6">{row.draws}</td>
                  <td class="px-5 py-3 text-right font-mono text-zinc-400 sm:px-6">{row.losses}</td>
                  <td class="px-5 py-3 text-right font-mono text-sm font-semibold text-zinc-50 sm:px-6">
                    {fmtPoints(row.points)}
                  </td>
                </tr>
              {:else}
                <tr>
                  <td class="px-5 py-8 text-sm text-zinc-400 sm:px-6" colspan="7">No players yet.</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </details>
    </section>

    <section class="rounded-2xl border border-zinc-800/80 bg-zinc-900/35 shadow-lg shadow-black/20 ring-1 ring-inset ring-white/5 backdrop-blur-md">
      <div class="border-b border-zinc-800/80 bg-zinc-950/30 px-5 py-4 sm:px-6">
        <h2 class="text-sm font-semibold text-zinc-100">Open matches</h2>
        <p class="mt-1 text-xs text-zinc-500">Who each player still needs to play.</p>
      </div>
      <ul class="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
        {#each openMatchesPerPlayer as row (row.playerId)}
          <li class="flex flex-col rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 ring-1 ring-inset ring-white/5">
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 items-center gap-2">
                <FactionMark factionId={row.factionId} sizeClass="h-8 w-8 shrink-0" />
                <span class="font-medium text-zinc-100">{row.playerName}</span>
              </div>
              <span class="shrink-0 rounded-full bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium tabular-nums text-zinc-400">
                {row.opponents.length} open
              </span>
            </div>
            {#if row.opponents.length > 0}
              <div class="mt-3 flex flex-wrap gap-1.5">
                {#each row.opponents as op (op.id)}
                  <span
                    class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/60 py-1 pl-1 pr-2 text-xs text-zinc-300 ring-1 ring-inset ring-white/5"
                  >
                    <FactionMark factionId={op.factionId} sizeClass="h-5 w-5" />
                    {op.name}
                  </span>
                {/each}
              </div>
            {:else}
              <p class="mt-3 text-xs font-medium text-emerald-400/90">All matches played.</p>
            {/if}
          </li>
        {:else}
          <li class="col-span-full rounded-xl border border-dashed border-zinc-700/60 p-6 text-center text-sm text-zinc-400">
            No players in this league.
          </li>
        {/each}
      </ul>
    </section>

    <section class="rounded-2xl border border-zinc-800/80 bg-zinc-900/35 shadow-lg shadow-black/20 ring-1 ring-inset ring-white/5 backdrop-blur-md">
      <div class="border-b border-zinc-800/80 bg-zinc-950/30 px-5 py-4 sm:px-6">
        <h2 class="text-sm font-semibold text-zinc-100">Recent results</h2>
      </div>
      <ul class="divide-y divide-zinc-800/60">
        {#each recent as m (m.id)}
          <li class="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
              <span class="inline-flex items-center gap-1.5 font-medium text-zinc-100">
                <FactionMark factionId={m.playerAFactionId} sizeClass="h-6 w-6 shrink-0" />
                {m.playerAName}
              </span>
              <span class="text-xs font-semibold uppercase tracking-wider text-zinc-600">vs</span>
              <span class="inline-flex items-center gap-1.5 font-medium text-zinc-100">
                <FactionMark factionId={m.playerBFactionId} sizeClass="h-6 w-6 shrink-0" />
                {m.playerBName}
              </span>
              <span class="ml-0 text-zinc-500 sm:ml-2">—</span>
              <span class="text-zinc-400">{publicResultLabel(m)}</span>
            </div>
            {#if m.recordedAt}
              <time class="text-xs tabular-nums text-zinc-500">{new Date(m.recordedAt).toLocaleString()}</time>
            {/if}
          </li>
        {:else}
          <li class="px-5 py-8 text-sm text-zinc-400 sm:px-6">No results yet.</li>
        {/each}
      </ul>
      {#if hasMoreRecent}
        <div class="border-t border-zinc-800/60 px-5 py-4 text-center sm:px-6">
          <a
            class="inline-flex items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-950/50 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900/60"
            href="?recent={nextRecentLimit}"
          >
            Load more
          </a>
        </div>
      {/if}
    </section>
  </div>
</main>
