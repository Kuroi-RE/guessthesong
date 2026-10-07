import { LADDER_SIZE, type RoundStatus } from "./game";

const KEY = "tebaklagu.stats.v1";

export interface Stats {
  played: number;
  won: number;
  streak: number;
  bestStreak: number;
  /**
   * Jumlah kemenangan per tahap tangga, plus satu slot terakhir untuk ronde
   * yang tidak tertebak. Panjangnya LADDER_SIZE + 1.
   */
  distribution: number[];
}

export const EMPTY_STATS: Stats = {
  played: 0,
  won: 0,
  streak: 0,
  bestStreak: 0,
  distribution: Array.from({ length: LADDER_SIZE + 1 }, () => 0),
};

function isStats(value: unknown): value is Stats {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Stats>;
  return (
    typeof candidate.played === "number" &&
    typeof candidate.won === "number" &&
    typeof candidate.streak === "number" &&
    typeof candidate.bestStreak === "number" &&
    Array.isArray(candidate.distribution) &&
    candidate.distribution.length === LADDER_SIZE + 1
  );
}

export function readStats(): Stats {
  if (typeof window === "undefined") return EMPTY_STATS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_STATS;
    const parsed: unknown = JSON.parse(raw);
    return isStats(parsed) ? parsed : EMPTY_STATS;
  } catch {
    // Local storage bisa diblokir (mode privat, pengaturan situs). Game tetap
    // jalan tanpa statistik, jadi kegagalan di sini bukan error untuk pemain.
    return EMPTY_STATS;
  }
}

function writeStats(stats: Stats): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    // Sama seperti di readStats: diabaikan dengan sadar, bukan ditelan.
  }
}

export function recordRound(
  current: Stats,
  status: Exclude<RoundStatus, "playing">,
  winningStep: number | null,
): Stats {
  const distribution = [...current.distribution];
  const slot = status === "won" && winningStep !== null ? winningStep : LADDER_SIZE;
  distribution[slot] = (distribution[slot] ?? 0) + 1;

  const streak = status === "won" ? current.streak + 1 : 0;

  const next: Stats = {
    played: current.played + 1,
    won: current.won + (status === "won" ? 1 : 0),
    streak,
    bestStreak: Math.max(current.bestStreak, streak),
    distribution,
  };

  writeStats(next);
  return next;
}

export function winRate(stats: Stats): number {
  if (stats.played === 0) return 0;
  return Math.round((stats.won / stats.played) * 100);
}
