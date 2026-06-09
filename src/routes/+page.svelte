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
  <div class="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-10 sm:px-8 sm:py-14">
    <header class="max-w-xl space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400/90">Round robin</p>
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Leagues</h1>
      <p class="text-sm leading-relaxed text-zinc-400">
        Open a league for live standings, who still owes a match, and recent results — without noise.
      </p>
    </header>

    {#if data.leagues.length === 0}
      <div
        class="rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-950/40 px-6 py-16 text-center backdrop-blur-sm"
      >
        <p class="text-sm text-zinc-400">No public leagues yet.</p>
        <p class="mt-2 text-xs text-zinc-500">Create one from the admin area when you are ready.</p>
      </div>
    {:else}
      <ul class="grid gap-4 sm:grid-cols-2">
        {#each data.leagues as l, i (l.id)}
          {@const accent = leagueCardAccent(i)}
          {@const p = pct(l.matchCompleted, l.matchTotal)}
          <li>
            <a
              class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/35 p-5 shadow-lg shadow-black/20 ring-1 ring-inset ring-white/5 backdrop-blur-md transition hover:border-zinc-600/90 hover:bg-zinc-900/55 hover:ring-white/10"
              href={`/l/${l.slug}`}
            >
              <div
                class="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-70 blur-2xl transition group-hover:opacity-100 {accent.glow}"
              ></div>
              <div class="relative flex flex-1 flex-col gap-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <h2 class="truncate text-lg font-semibold tracking-tight text-zinc-50 group-hover:text-white">
                      {l.name}
                    </h2>
                    <p class="mt-1.5 text-xs text-zinc-500">
                      {l.playerCount} players
                      <span class="mx-1.5 text-zinc-600">·</span>
                      {l.matchCompleted}/{l.matchTotal} matches
                    </p>
                  </div>
                  <span
                    class={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${statusBadgeClass(l.status)}`}
                  >
                    {statusLabel(l.status)}
                  </span>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    <span>Season progress</span>
                    <span class="tabular-nums text-zinc-400">{p}%</span>
                  </div>
                  <div class="h-1.5 overflow-hidden rounded-full bg-zinc-950/80 ring-1 ring-inset ring-white/5">
                    <div
                      class={`h-full rounded-full transition-[width] duration-500 ease-out ${accent.bar}`}
                      style={`width: ${p}%`}
                    ></div>
                  </div>
                </div>
                <div class="mt-auto flex items-center justify-between border-t border-zinc-800/60 pt-4 text-xs font-medium text-zinc-400">
                  <span class="group-hover:text-teal-300/90">View league</span>
                  <span
                    class="translate-x-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-zinc-400"
                    aria-hidden="true"
                    >→</span
                  >
                </div>
              </div>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</main>
