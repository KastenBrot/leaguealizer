/**
 * Static app data: dropdown options, asset paths, labels.
 * Edit values here only — logic lives in feature modules (e.g. `$lib/factions.ts`).
 */

// --- App links ---

export const GITHUB_REPO_URL = 'https://github.com/KastenBrot/league';

// --- UI limits ---

export const RECENT_RESULTS_STEP = 5;
export const RECENT_RESULTS_MAX = 100;

// --- Faction icons (`static/spearhead-factions/`) ---

export const FACTION_ICONS = {
  defaultUrl: '/spearhead-factions/default.svg'
} as const;

// --- Spearhead factions (player army picker) ---

export const SPEARHEAD_FACTIONS = [
  {
    id: 'stormcast-eternals',
    name: 'Stormcast Eternals',
    iconUrl: '/spearhead-factions/stormcast-eternals.svg'
  },
  {
    id: 'cities-of-sigmar',
    name: 'Cities of Sigmar',
    iconUrl: '/spearhead-factions/cities-of-sigmar.svg'
  },
  {
    id: 'lumineth-realm-lords',
    name: 'Lumineth Realm-lords',
    iconUrl: '/spearhead-factions/lumineth-realm-lords.svg'
  },
  { id: 'sylvaneth', name: 'Sylvaneth', iconUrl: '/spearhead-factions/sylvaneth.svg' },
  {
    id: 'daughters-of-khaine',
    name: 'Daughters of Khaine',
    iconUrl: '/spearhead-factions/daughters-of-khaine.svg'
  },
  {
    id: 'idoneth-deepkin',
    name: 'Idoneth Deepkin',
    iconUrl: '/spearhead-factions/idoneth-deepkin.svg'
  },
  { id: 'fyreslayers', name: 'Fyreslayers', iconUrl: '/spearhead-factions/fyreslayers.svg' },
  {
    id: 'kharadron-overlords',
    name: 'Kharadron Overlords',
    iconUrl: '/spearhead-factions/kharadron-overlords.svg'
  },
  { id: 'seraphon', name: 'Seraphon', iconUrl: '/spearhead-factions/seraphon.svg' },
  { id: 'skaven', name: 'Skaven', iconUrl: '/spearhead-factions/skaven.svg' },
  {
    id: 'slaves-to-darkness',
    name: 'Slaves to Darkness',
    iconUrl: '/spearhead-factions/slaves-to-darkness.svg'
  },
  {
    id: 'blades-of-khorne',
    name: 'Blades of Khorne',
    iconUrl: '/spearhead-factions/blades-of-khorne.svg'
  },
  {
    id: 'maggotkit-of-nurgle',
    name: 'Maggotkit of Nurgle',
    iconUrl: '/spearhead-factions/maggotkit-of-nurgle.svg'
  },
  {
    id: 'deciples-of-tzeentch',
    name: 'Deciples of Tzeentch',
    iconUrl: '/spearhead-factions/deciples-of-tzeentch.svg'
  },
  {
    id: 'soulblight-gravelords',
    name: 'Soulblight Gravelords',
    iconUrl: '/spearhead-factions/soulblight-gravelords.svg'
  },
  {
    id: 'ossiarch-bonereapers',
    name: 'Ossiarch Bonereapers',
    iconUrl: '/spearhead-factions/ossiarch-bonereapers.svg'
  },
  { id: 'nighthaunt', name: 'Nighthaunt', iconUrl: '/spearhead-factions/nighthaunt.svg' },
  {
    id: 'flesh-eater-courts',
    name: 'Flesh-Eater Courts',
    iconUrl: '/spearhead-factions/flesh-eater-courts.svg'
  },
  { id: 'ironjawz', name: 'Ironjawz', iconUrl: '/spearhead-factions/ironjawz.svg' },
  { id: 'kruelboyz', name: 'Kruelboyz', iconUrl: '/spearhead-factions/kruelboyz.svg' },
  {
    id: 'gloomspite-gitz',
    name: 'Gloomspite Gitz',
    iconUrl: '/spearhead-factions/gloomspite-gitz.svg'
  },
  {
    id: 'mordian-marauders',
    name: 'Mordian Marauders',
    iconUrl: '/spearhead-factions/mordian-marauders.svg'
  },
  {
    id: 'sons-of-behemat',
    name: 'Sons of Behemat',
    iconUrl: '/spearhead-factions/sons-of-behemoth.svg'
  },
  {
    id: 'ogor-mawtribes',
    name: 'Ogor Mawtribes',
    iconUrl: '/spearhead-factions/ogor-mawtribes.svg'
  }
] as const;
