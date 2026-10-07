export const GENRE_IDS = [
  "pop-id",
  "dangdut",
  "rock-indie-id",
  "pop-intl",
  "hip-hop",
  "k-pop",
] as const;

export type GenreId = (typeof GENRE_IDS)[number];

export const ERA_IDS = ["classic", "2000s", "2010s", "2020s"] as const;
export type EraId = (typeof ERA_IDS)[number];

export const DIFFICULTY_IDS = [
  "easy",
  "medium",
  "hard",
  "expert",
  "impossible",
] as const;
export type DifficultyId = (typeof DIFFICULTY_IDS)[number];

/**
 * Tier popularitas dikurasi manual, bukan diambil dari metrik streaming.
 * 1 berarti lagu yang hampir semua orang di segmen targetnya kenal,
 * 5 berarti lagu yang hanya dikenal pendengar genre itu.
 * Angka ini adalah penilaian kurator, jadi tidak ditampilkan ke pemain
 * sebagai data dan hanya dipakai untuk memetakan tingkat kesulitan.
 */
export type PopularityTier = 1 | 2 | 3 | 4 | 5;

export interface CatalogSong {
  id: string;
  title: string;
  artist: string;
  /** Judul lain yang juga diterima saat mencocokkan jawaban (PRD R-05). */
  altTitles?: string[];
  /** Tahun rilis rekaman, dipakai untuk filter era. */
  year: number;
  genre: GenreId;
  tier: PopularityTier;
  /** Dipakai kalau pencarian "judul + artis" apa adanya tidak menemukan lagunya. */
  searchTerm?: string;
}

/** Lagu yang sudah lengkap dengan hasil pencarian preview. */
export interface ResolvedSong extends CatalogSong {
  previewUrl: string;
  artworkUrl: string | null;
  itunesTrackId: number;
}

export const DIFFICULTY_TIERS: Record<DifficultyId, PopularityTier[]> = {
  easy: [1],
  medium: [1, 2],
  hard: [2, 3],
  expert: [3, 4],
  impossible: [4, 5],
};

export function eraOf(year: number): EraId {
  if (year < 2000) return "classic";
  if (year < 2010) return "2000s";
  if (year < 2020) return "2010s";
  return "2020s";
}
