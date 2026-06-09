<script lang="ts">
  import FactionMark from '$lib/components/FactionMark.svelte';
  import { getSpearheadFaction, SPEARHEAD_FACTIONS } from '$lib/factions';
  import { fmtPoints, statusBadgeClass, statusLabel } from '$lib/ui';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  $: league = data.league;
  $: players = data.players;
  $: matches = data.matches;
  $: stats = data.stats;
  $: standings = data.standings;
  $: canManageRoster = data.canManageRoster;

  let editingPlayerId: number | null = null;
  let editName = '';
  let editFactionId = '';

  $: if (form?.success) {
    editingPlayerId = null;
  }

  $: playersWithResults = new Set(data.playerIdsWithResults);

  function startEdit(p: { id: number; name: string; factionId: string }) {
    editingPlayerId = p.id;
    editName = p.name;
    editFactionId = p.factionId;
  }

  function cancelEdit() {
    editingPlayerId = null;
  }

  function confirmRemove(p: { id: number; name: string }): boolean {
    if (!playersWithResults.has(p.id)) return true;
    return confirm(
      `Remove ${p.name}? This deletes all of their scheduled matches and recorded results.`
    );
  }

  function resultLabel(m: (typeof matches)[number]): string {
    if (!m.result) return 'open';
    if (m.result === 'draw') return 'draw';
    if (m.result === 'a') return `${m.playerAName} won`;
    return `${m.playerBName} won`;
  }

</script>

<main class="relative z-10 min-h-dvh text-zinc-50">
  <div class="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-12">
    <header
      class="flex flex-col gap-6 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-xl shadow-black/25 ring-1 ring-inset ring-white/5 backdrop-blur-md sm:flex-row sm:items-start sm:justify-between sm:p-8"
    >
      <div class="min-w-0 space-y-3">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">League</p>
        <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">{league.name}</h1>
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
          <span class="font-mono text-zinc-400">/l/{league.slug}</span>
          <span class="text-zinc-700">·</span>
          <span class={`rounded-full border px-2 py-0.5 font-medium uppercase tracking-wide ${statusBadgeClass(league.status)}`}>
            {statusLabel(league.status)}
          </span>
          <span class="text-zinc-700">·</span>
          <a class="text-teal-400/90 underline-offset-4 hover:text-teal-300 hover:underline" href={`/l/${league.slug}`}>Public page</a>
          <span class="text-zinc-700">·</span>
          <a class="text-teal-400/90 underline-offset-4 hover:text-teal-300 hover:underline" href="/admin">Admin</a>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        {#if league.status === 'draft'}
          <form method="POST" action="?/startLeague">
            <button
              class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-500"
              type="submit"
            >
              Start league
            </button>
          </form>
        {/if}
        {#if league.status === 'active'}
          <form method="POST" action="?/finish">
            <button
              class="rounded-xl border border-zinc-700/80 bg-zinc-950/50 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900/60"
              type="submit"
            >
              Mark finished
            </button>
          </form>
        {/if}
        {#if league.status === 'finished'}
          <form method="POST" action="?/reopen">
            <button
              class="rounded-xl border border-zinc-700/80 bg-zinc-950/50 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900/60"
              type="submit"
            >
              Reopen
            </button>
          </form>
        {/if}
      </div>
    </header>

    {#if form?.error}
      <div class="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200 ring-1 ring-inset ring-red-500/10">
        {form.error}
      </div>
    {/if}

    <section class="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/35 shadow-lg shadow-black/20 ring-1 ring-inset ring-white/5 backdrop-blur-md">
      <div class="flex flex-col gap-1 border-b border-zinc-800/80 bg-zinc-950/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h2 class="text-sm font-semibold text-zinc-100">Players ({players.length})</h2>
        <span class="text-xs tabular-nums text-zinc-500">{stats.completed}/{stats.total} matches recorded</span>
      </div>

      {#if canManageRoster}
        <form method="POST" action="?/addPlayer" class="flex flex-col gap-3 border-b border-zinc-800/80 p-4 sm:px-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
            <label class="flex min-w-0 flex-1 flex-col gap-1">
              <span class="text-xs font-medium text-zinc-500">Name</span>
              <input
                class="min-w-0 rounded-xl border border-zinc-700/80 bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-1 ring-inset ring-white/5 focus:border-teal-500/50"
                name="name"
                required
                placeholder="Player name"
              />
            </label>
            <label class="flex w-full flex-col gap-1 sm:w-56">
              <span class="text-xs font-medium text-zinc-500">Spearhead faction</span>
              <select
                name="factionId"
                required
                class="rounded-xl border border-zinc-700/80 bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-1 ring-inset ring-white/5 focus:border-teal-500/50"
              >
                <option value="" disabled selected>Select faction</option>
                {#each SPEARHEAD_FACTIONS as f (f.id)}
                  <option value={f.id}>{f.name}</option>
                {/each}
              </select>
            </label>
            <button
              class="shrink-0 rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700/50 sm:mb-0"
              type="submit"
            >
              Add
            </button>
          </div>
        </form>
      {/if}

      <ul class="divide-y divide-zinc-800/60">
        {#each players as p (p.id)}
          <li class="px-5 py-3 sm:px-6">
            {#if canManageRoster && editingPlayerId === p.id}
              <form
                method="POST"
                action="?/updatePlayer"
                class="flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <input type="hidden" name="playerId" value={p.id} />
                <label class="flex min-w-0 flex-1 flex-col gap-1">
                  <span class="text-xs font-medium text-zinc-500">Name</span>
                  <input
                    class="min-w-0 rounded-xl border border-zinc-700/80 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-inset ring-white/5 focus:border-teal-500/50"
                    name="name"
                    required
                    bind:value={editName}
                  />
                </label>
                <label class="flex w-full flex-col gap-1 sm:w-56">
                  <span class="text-xs font-medium text-zinc-500">Spearhead faction</span>
                  <select
                    name="factionId"
                    required
                    class="rounded-xl border border-zinc-700/80 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-inset ring-white/5 focus:border-teal-500/50"
                    bind:value={editFactionId}
                  >
                    {#each SPEARHEAD_FACTIONS as f (f.id)}
                      <option value={f.id}>{f.name}</option>
                    {/each}
                  </select>
                </label>
                <div class="flex shrink-0 gap-2">
                  <button
                    class="rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-3 py-2 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700/50"
                    type="submit"
                  >
                    Save
                  </button>
                  <button
                    class="rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-400 transition hover:text-zinc-200"
                    type="button"
                    onclick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            {:else}
              <div class="flex items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <FactionMark factionId={p.factionId} sizeClass="h-9 w-9" />
                  <div class="min-w-0">
                    <span class="font-medium text-zinc-100">{p.name}</span>
                    <p class="truncate text-xs text-zinc-500">
                      {getSpearheadFaction(p.factionId)?.name ?? p.factionId}
                    </p>
                  </div>
                </div>
                {#if canManageRoster}
                  <div class="flex shrink-0 gap-2">
                    <button
                      class="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-2.5 py-1 text-xs text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200"
                      type="button"
                      onclick={() => startEdit(p)}
                    >
                      Edit
                    </button>
                    <form method="POST" action="?/removePlayer">
                      <input type="hidden" name="playerId" value={p.id} />
                      <button
                        class="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-2.5 py-1 text-xs text-zinc-400 transition hover:border-red-900/50 hover:bg-red-950/40 hover:text-red-200"
                        type="submit"
                        onclick={(e) => {
                          if (!confirmRemove(p)) e.preventDefault();
                        }}
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                {/if}
              </div>
            {/if}
          </li>
        {:else}
          <li class="px-5 py-8 text-sm text-zinc-400 sm:px-6">No players yet.</li>
        {/each}
      </ul>

      {#if league.status !== 'draft'}
        <div class="border-t border-zinc-800/80 bg-zinc-950/20 p-4 sm:px-6">
          <form method="POST" action="?/resetSchedule">
            <button
              class="rounded-xl border border-red-900/40 bg-red-950/20 px-3 py-2 text-xs font-medium text-red-200/90 transition hover:bg-red-950/40"
              type="submit"
              onclick={(e) => {
                if (!confirm('This deletes all recorded results and returns the league to draft. Continue?')) e.preventDefault();
              }}
            >
              Reset schedule (back to draft)
            </button>
          </form>
        </div>
      {/if}
    </section>

    {#if matches.length > 0}
      <section>
        <h2 class="mb-4 text-sm font-semibold text-zinc-300">Matches</h2>
        <ul class="grid gap-4 lg:grid-cols-2">
          {#each matches as m (m.id)}
            <li
              class="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/35 p-5 shadow-md shadow-black/15 ring-1 ring-inset ring-white/5 backdrop-blur-md"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex min-w-0 flex-1 items-center justify-between gap-2 text-sm">
                  <span class="flex min-w-0 flex-1 items-center gap-2 truncate font-semibold text-zinc-100">
                    <FactionMark factionId={m.playerAFactionId} sizeClass="h-7 w-7 shrink-0" />
                    <span class="truncate">{m.playerAName}</span>
                  </span>
                  <span class="shrink-0 text-[10px] font-bold uppercase tracking-widest text-zinc-600">vs</span>
                  <span class="flex min-w-0 flex-1 items-center justify-end gap-2 truncate text-right font-semibold text-zinc-100">
                    <span class="truncate">{m.playerBName}</span>
                    <FactionMark factionId={m.playerBFactionId} sizeClass="h-7 w-7 shrink-0" />
                  </span>
                </div>
              </div>
              <p class="text-xs text-zinc-500">{resultLabel(m)}</p>
              <div class="flex flex-wrap items-center gap-2 border-t border-zinc-800/60 pt-4">
                <form method="POST" action="?/recordResult" class="flex flex-wrap gap-2">
                  <input type="hidden" name="matchId" value={m.id} />
                  <button
                    type="submit"
                    name="result"
                    value="a"
                    class={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${m.result === 'a' ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-100' : 'border-zinc-700/80 bg-zinc-950/40 text-zinc-300 hover:border-zinc-500'}`}
                  >
                    {m.playerAName} wins
                  </button>
                  <button
                    type="submit"
                    name="result"
                    value="draw"
                    class={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${m.result === 'draw' ? 'border-amber-500/45 bg-amber-950/40 text-amber-100' : 'border-zinc-700/80 bg-zinc-950/40 text-zinc-300 hover:border-zinc-500'}`}
                  >
                    Draw
                  </button>
                  <button
                    type="submit"
                    name="result"
                    value="b"
                    class={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${m.result === 'b' ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-100' : 'border-zinc-700/80 bg-zinc-950/40 text-zinc-300 hover:border-zinc-500'}`}
                  >
                    {m.playerBName} wins
                  </button>
                </form>
                {#if m.result}
                  <form method="POST" action="?/clearResult">
                    <input type="hidden" name="matchId" value={m.id} />
                    <button
                      class="rounded-lg border border-zinc-800/80 bg-zinc-950/30 px-2.5 py-1.5 text-xs text-zinc-500 transition hover:text-zinc-300"
                      type="submit"
                    >
                      Clear
                    </button>
                  </form>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if standings.length > 0}
      <section class="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/35 shadow-lg shadow-black/20 ring-1 ring-inset ring-white/5 backdrop-blur-md">
        <div class="border-b border-zinc-800/80 bg-zinc-950/30 px-5 py-4 sm:px-6">
          <h2 class="text-sm font-semibold text-zinc-100">Standings preview</h2>
        </div>
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
                <tr class={`border-b border-zinc-800/50 ${i % 2 === 1 ? 'bg-zinc-950/25' : ''}`}>
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
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {/if}

    <section
      class="rounded-2xl border border-red-900/35 bg-red-950/15 p-5 shadow-inner ring-1 ring-inset ring-red-500/10 sm:p-6"
    >
      <h2 class="mb-3 text-sm font-semibold text-red-200">Danger zone</h2>
      <form method="POST" action="?/delete">
        <button
          class="rounded-xl border border-red-800/60 bg-red-950/40 px-4 py-2 text-xs font-medium text-red-100 transition hover:bg-red-950/60"
          type="submit"
          onclick={(e) => {
            if (!confirm('Delete this league and all its data? This cannot be undone.')) e.preventDefault();
          }}
        >
          Delete league
        </button>
      </form>
    </section>
  </div>
</main>
