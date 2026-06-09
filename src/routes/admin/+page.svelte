<script lang="ts">
  import { leagueCardAccent } from '$lib/leagueCardAccent';
  import { statusBadgeClass, statusLabel } from '$lib/ui';
  import type { PageData } from './$types';

  export let data: PageData;

  function pct(c: number, t: number) {
    if (!t) return 0;
    return Math.round((c / t) * 100);
  }
</script>

<main class="relative z-10 min-h-dvh text-zinc-50">
  <div class="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-10 sm:px-8 sm:py-12">
    <header class="flex flex-col gap-6 border-b border-zinc-800/60 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-3">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">Console</p>
        <h1 class="text-3xl font-semibold tracking-tight">Admin</h1>
        <p class="text-sm text-zinc-400">
          Signed in as <span class="font-medium text-zinc-200">{data.user?.username}</span>
          <span class="mx-2 text-zinc-700">·</span>
          <a class="text-teal-400/90 underline-offset-4 hover:text-teal-300 hover:underline" href="/">Public site</a>
          <span class="mx-2 text-zinc-700">·</span>
          <a class="text-teal-400/90 underline-offset-4 hover:text-teal-300 hover:underline" href="/logout">Logout</a>
        </p>
      </div>
      <a
        class="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/20 transition hover:bg-white"
        href="/admin/leagues/new"
      >
        New league
        <span aria-hidden="true">+</span>
      </a>
    </header>

    <section>
      <h2 class="mb-4 text-sm font-semibold text-zinc-300">Your leagues</h2>
      {#if data.leagues.length === 0}
        <div
          class="rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-900/30 px-6 py-14 text-center backdrop-blur-sm"
        >
          <p class="text-sm text-zinc-400">No leagues yet.</p>
          <p class="mt-2 text-xs text-zinc-500">Create one to add players and generate the schedule.</p>
        </div>
      {:else}
        <ul class="grid gap-4 sm:grid-cols-2">
          {#each data.leagues as l, i (l.id)}
            {@const accent = leagueCardAccent(i)}
            {@const p = pct(l.matchCompleted, l.matchTotal)}
            <li>
              <a
                class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/35 p-5 shadow-lg shadow-black/20 ring-1 ring-inset ring-white/5 backdrop-blur-md transition hover:border-zinc-600/90 hover:bg-zinc-900/55"
                href={`/admin/leagues/${l.slug}`}
              >
                <div
                  class="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition group-hover:opacity-90 {accent.glow}"
                ></div>
                <div class="relative flex flex-1 flex-col gap-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <h3 class="truncate text-lg font-semibold text-zinc-50 group-hover:text-white">{l.name}</h3>
                      <p class="mt-1 font-mono text-[11px] text-zinc-500">/l/{l.slug}</p>
                    </div>
                    <span
                      class={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${statusBadgeClass(l.status)}`}
                    >
                      {statusLabel(l.status)}
                    </span>
                  </div>
                  <p class="text-xs text-zinc-500">
                    {l.playerCount} players
                    <span class="mx-1.5 text-zinc-600">·</span>
                    {l.matchCompleted}/{l.matchTotal} matches
                  </p>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      <span>Progress</span>
                      <span class="tabular-nums text-zinc-400">{p}%</span>
                    </div>
                    <div class="h-1.5 overflow-hidden rounded-full bg-zinc-950/80 ring-1 ring-inset ring-white/5">
                      <div class={`h-full rounded-full ${accent.bar}`} style={`width: ${p}%`}></div>
                    </div>
                  </div>
                  <span class="mt-auto border-t border-zinc-800/60 pt-3 text-xs font-medium text-violet-300/80 group-hover:text-violet-200">
                    Manage →
                  </span>
                </div>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </div>
</main>
