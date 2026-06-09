/** Friendly labels and classes for public-facing UI. */

export function statusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Live';
    case 'draft':
      return 'Warming up';
    case 'finished':
      return 'Wrapped';
    default:
      return status;
  }
}

export function statusBadgeClass(status: string): string {
  if (status === 'active') return 'border-emerald-500/40 bg-emerald-950/45 text-emerald-100';
  if (status === 'finished') return 'border-zinc-600/50 bg-zinc-800/60 text-zinc-300';
  return 'border-amber-500/40 bg-amber-950/45 text-amber-100';
}

export function fmtPoints(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function publicResultLabel(m: {
  result: string | null;
  playerAName: string;
  playerBName: string;
}): string {
  if (m.result === 'draw') return 'Draw — mutual coping';
  if (m.result === 'a') return `${m.playerAName} took the W`;
  if (m.result === 'b') return `${m.playerBName} took the W`;
  return 'Open';
}

export function podiumRankLabel(rank: 1 | 2): string {
  if (rank === 1) return 'Champ';
  return 'Almost there';
}
