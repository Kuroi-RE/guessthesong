/** Tangga durasi dari PRD R-01. Indeks babak = indeks di array ini. */
export const CLIP_STEPS = [0.1, 0.5, 2, 8, 15] as const;

/** PRD R-02: maksimal 5 sampai 6 tebakan. Dipilih 6 supaya tahap 15s bisa ditebak dua kali. */
export const MAX_ATTEMPTS = 6;

export const LADDER_SIZE = CLIP_STEPS.length;

export function clipSeconds(step: number): number {
  const index = Math.min(step, CLIP_STEPS.length - 1);
  return CLIP_STEPS[index] ?? CLIP_STEPS[0];
}

/**
 * Lebar segmen tangga sebanding dengan akar durasi, bukan dengan durasinya.
 * Kalau lebarnya sebanding lurus, segmen 0,1 detik jadi sub-piksel dan tidak
 * terlihat sama sekali; akar menjaga perbandingannya tetap terbaca sambil
 * membuat segmen 15 detik jelas paling lebar (design.md Bagian 3).
 */
export function ladderWeights(): number[] {
  return CLIP_STEPS.map((seconds) => Math.sqrt(seconds));
}

/**
 * Angka durasi di UI utama tetap dalam bentuk teknis (0.1s) supaya konsisten
 * dengan nilai yang dipakai mesin audio. Teks naratif memakai pemisah desimal
 * sesuai bahasa, dan itu diurus oleh file terjemahan (design.md Bagian 12).
 */
export function formatClip(seconds: number): string {
  return `${seconds % 1 === 0 ? seconds : seconds.toFixed(1)}s`;
}

export type GuessOutcome = "wrong" | "skipped" | "correct";

export interface AttemptRecord {
  outcome: GuessOutcome;
  /** Judul yang ditebak. Kosong untuk skip, karena tidak ada tebakan. */
  guessTitle: string;
  /** Tahap tangga saat tebakan dibuat. */
  step: number;
}

export type RoundStatus = "playing" | "won" | "lost";

/** Blok geometris, bukan emoji (design.md 8.5 dan 14.1). */
const BLOCK_UNUSED = "\u2591";
const BLOCK_USED = "\u2593";
const BLOCK_HIT = "\u2588";

export interface SharePayload {
  attempts: readonly AttemptRecord[];
  status: RoundStatus;
  siteLabel: string;
  dateLabel: string;
  productName: string;
  resultLine: string;
}

/**
 * Teks share tidak pernah memuat judul lagu (PRD R-12).
 * Pola lima karakter selalu, jadi lebarnya tetap saat ditempel ke aplikasi chat.
 */
export function buildShareText(payload: SharePayload): string {
  const hitStep =
    payload.status === "won"
      ? payload.attempts.find((attempt) => attempt.outcome === "correct")?.step
      : undefined;

  const usedSteps = new Set(payload.attempts.map((attempt) => attempt.step));

  const pattern = CLIP_STEPS.map((_, index) => {
    if (hitStep === index) return BLOCK_HIT;
    if (usedSteps.has(index)) return BLOCK_USED;
    return BLOCK_UNUSED;
  }).join("");

  return [
    `${payload.productName} ${payload.dateLabel}`,
    `${pattern}  ${payload.resultLine}`,
    payload.siteLabel,
  ].join("\n");
}
