import raw from "@/data/songs.json";
import {
  DIFFICULTY_TIERS,
  eraOf,
  type CatalogSong,
  type DifficultyId,
  type EraId,
  type GenreId,
} from "./catalog-types";

export {
  isCorrectGuess,
  normalize,
  suggest,
  titlesOf,
  type Highlight,
  type Suggestion,
} from "./matching";

export const CATALOG = raw.songs as CatalogSong[];

export interface CatalogFilters {
  genre: GenreId | "all";
  era: EraId | "any";
  difficulty: DifficultyId;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  genre: "all",
  era: "any",
  difficulty: "medium",
};

export function filterCatalog(filters: CatalogFilters): CatalogSong[] {
  const tiers = DIFFICULTY_TIERS[filters.difficulty];
  return CATALOG.filter((song) => {
    if (filters.genre !== "all" && song.genre !== filters.genre) return false;
    if (filters.era !== "any" && eraOf(song.year) !== filters.era) return false;
    return tiers.includes(song.tier);
  });
}

/**
 * Memilih lagu berikutnya tanpa mengulang lagu yang baru saja dipakai.
 * Kalau semua lagu yang lolos filter sudah terpakai, riwayat diabaikan supaya
 * pemain tidak terjebak di keadaan kosong yang sebenarnya bukan kosong.
 */
export function pickSong(
  filters: CatalogFilters,
  recentIds: readonly string[],
): CatalogSong | null {
  const pool = filterCatalog(filters);
  if (pool.length === 0) return null;
  const fresh = pool.filter((song) => !recentIds.includes(song.id));
  const from = fresh.length > 0 ? fresh : pool;
  const index = Math.floor(Math.random() * from.length);
  return from[index] ?? null;
}

export function countByGenre(): Record<GenreId, number> {
  const counts = {} as Record<GenreId, number>;
  for (const song of CATALOG) {
    counts[song.genre] = (counts[song.genre] ?? 0) + 1;
  }
  return counts;
}
