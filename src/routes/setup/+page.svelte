<script lang="ts">
  export let form: any;
</script>

<main class="min-h-dvh bg-zinc-950 text-zinc-50">
  <div class="mx-auto flex max-w-lg flex-col gap-6 p-6">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight">First-time setup</h1>
      <p class="text-sm text-zinc-300">Create the first admin account.</p>
    </header>

    {#if form?.error}
      <div class="rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-200">
        {form.error}
      </div>
    {/if}

    <form method="POST" class="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <label class="flex flex-col gap-1">
        <span class="text-sm text-zinc-300">Username</span>
        <input
          class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          name="username"
          autocomplete="username"
          required
          minlength="3"
          value={form?.username ?? ''}
        />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-zinc-300">Password</span>
        <input
          class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          type="password"
          name="password"
          autocomplete="new-password"
          required
          minlength="8"
        />
      </label>

      <button class="mt-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-white">
        Create account
      </button>
    </form>
  </div>
</main>
