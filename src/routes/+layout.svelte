<script lang="ts">
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import '../app.css';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
</script>

<div class="app-surface flex min-h-dvh flex-col">
  <div class="flex-1">
    <slot />
  </div>
  <SiteFooter showLogin={!data.user} />
</div>
