/** Rotating accents for league cards — full class strings for Tailwind. */
const LEAGUE_CARD_ACCENTS = [
  { glow: 'from-teal-400/20 via-teal-500/5 to-transparent', bar: 'bg-teal-400' },
  { glow: 'from-violet-400/20 via-violet-500/5 to-transparent', bar: 'bg-violet-400' },
  { glow: 'from-sky-400/20 via-sky-500/5 to-transparent', bar: 'bg-sky-400' },
  { glow: 'from-amber-400/15 via-amber-500/5 to-transparent', bar: 'bg-amber-400' },
  { glow: 'from-rose-400/15 via-rose-500/5 to-transparent', bar: 'bg-rose-400' },
  { glow: 'from-emerald-400/15 via-emerald-500/5 to-transparent', bar: 'bg-emerald-400' }
] as const;

export function leagueCardAccent(index: number) {
  return LEAGUE_CARD_ACCENTS[index % LEAGUE_CARD_ACCENTS.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
