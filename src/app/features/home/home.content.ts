/** Static content that belongs to the page design and does not come from the API. */
export const TECH: readonly string[] = [
  'Angular 22',
  'Laravel',
  'TypeScript',
  'Tailwind 4',
  'SSR',
  'Signals',
  'Sanctum',
  'MySQL',
];

export const LIGHTHOUSE_BARS: readonly number[] = [40, 55, 48, 70, 62, 85, 98];

export interface CardDecor {
  glyph: string;
  gradient: string;
}

/** Fallback artwork for cards whose item has no image. Cycled by index. */
export const CARD_DECOR: readonly CardDecor[] = [
  { glyph: '⌘', gradient: 'bg-[linear-gradient(135deg,#4c1d95,#7c5cff_60%,#22d3ee)]' },
  { glyph: '◍', gradient: 'bg-[linear-gradient(135deg,#0e7490,#22d3ee_60%,#34d399)]' },
  { glyph: '✦', gradient: 'bg-[linear-gradient(135deg,#9d174d,#ff5c8a_60%,#fbbf24)]' },
];

export function decorAt(index: number): CardDecor {
  return CARD_DECOR[index % CARD_DECOR.length]!;
}
