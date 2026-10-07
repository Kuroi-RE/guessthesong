import type { CatalogSong } from "./catalog-types";

/** Tanda baca dan huruf besar diabaikan saat mencocokkan (PRD R-05). */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Bentuk rapat: semua yang bukan huruf dan angka dibuang, termasuk spasi.
 *
 * Dibutuhkan karena normalize mengubah tanda baca menjadi spasi, sehingga
 * "D'Masiv" tersimpan sebagai "d masiv" dan "The S.I.G.I.T." sebagai
 * "the s i g i t". Pemain mengetik "dmasiv" dan "sigit", dan tanpa bentuk ini
 * keduanya tidak akan ketemu sama sekali.
 */
export function squeeze(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Mencari posisi `needle` di dalam `haystack` dengan dua bentuk sekaligus:
 * bentuk berspasi lebih dulu, lalu bentuk rapat sebagai cadangan.
 * Mengembalikan -1 kalau tidak ketemu di kedua bentuk.
 */
export function flexibleIndexOf(haystack: string, needle: string): number {
  const spaced = normalize(haystack).indexOf(normalize(needle));
  if (spaced !== -1) return spaced;
  return squeeze(haystack).indexOf(squeeze(needle));
}

/** Jarak Levenshtein dengan ambang, dihentikan lebih awal kalau sudah lewat. */
export function editDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        (prev[j] ?? 0) + 1,
        (row[j - 1] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost,
      );
      row[j] = value;
      if (value < best) best = value;
    }
    if (best > limit) return limit + 1;
    prev = row;
  }
  return prev[b.length] ?? limit + 1;
}

/**
 * Toleransi typo dibuat proporsional terhadap panjang judul: judul pendek
 * seperti "TT" tidak boleh menerima satu huruf salah, karena satu huruf
 * di judul dua karakter adalah judul yang berbeda.
 */
export function typoBudget(length: number): number {
  if (length <= 4) return 0;
  if (length <= 8) return 1;
  if (length <= 16) return 2;
  return 3;
}

export function titlesOf(song: CatalogSong): string[] {
  return [song.title, ...(song.altTitles ?? [])];
}

export function isCorrectGuess(song: CatalogSong, guess: string): boolean {
  const target = normalize(guess);
  if (target.length === 0) return false;
  const squeezedTarget = squeeze(guess);

  return titlesOf(song).some((title) => {
    const candidate = normalize(title);
    if (candidate === target) return true;
    // "gods plan" untuk "God's Plan": tanda baca yang dihilangkan pemain tidak
    // boleh menggagalkan jawaban yang sebenarnya benar.
    if (squeeze(title) === squeezedTarget) return true;
    const budget = typoBudget(candidate.length);
    if (budget === 0) return false;
    return editDistance(candidate, target, budget) <= budget;
  });
}

/** Rentang karakter pada string asli yang ditebalkan. */
export type Highlight = { from: number; to: number } | null;

export interface Suggestion {
  song: CatalogSong;
  matchedTitle: string;
  /** Rentang tebal pada judul. null kalau yang cocok bukan judulnya. */
  titleHighlight: Highlight;
  /** Rentang tebal pada nama artis. null kalau yang cocok bukan artisnya. */
  artistHighlight: Highlight;
}

/**
 * Rentang tebal dihitung pada string asli, bukan pada bentuk ternormalisasi,
 * karena normalisasi mengubah panjang string dan indeksnya tidak bisa dipakai.
 */
function highlightOf(original: string, rawQuery: string): Highlight {
  const at = original.toLowerCase().indexOf(rawQuery);
  if (at !== -1) return { from: at, to: at + rawQuery.length };

  // Pemain mengetik tanpa tanda baca ("dmasiv" untuk "D'Masiv"), jadi rentang
  // tebalnya dicari ulang dengan melangkahi karakter bukan huruf dan angka.
  const needle = squeeze(rawQuery);
  if (needle.length === 0) return null;

  let matched = 0;
  let start = -1;
  for (let i = 0; i < original.length; i += 1) {
    const ch = squeeze(original[i] ?? "");
    if (ch.length === 0) {
      // Tanda baca di tengah kecocokan dilangkahi, bukan memutus kecocokan.
      if (matched > 0) continue;
      continue;
    }
    if (ch === needle[matched]) {
      if (matched === 0) start = i;
      matched += 1;
      if (matched === needle.length) return { from: start, to: i + 1 };
    } else {
      matched = 0;
      start = -1;
      if (ch === needle[0]) {
        start = i;
        matched = 1;
      }
    }
  }
  return null;
}

/**
 * Peringkat hasil. Angka lebih kecil muncul lebih dulu.
 *
 * Judul diutamakan di atas artis karena yang diminta game ini adalah judul:
 * pemain yang mengetik sesuatu yang cocok sebagai judul hampir pasti sedang
 * mengetik judul. Awalan diutamakan di atas kecocokan di tengah karena orang
 * mengetik dari depan.
 */
const RANK = {
  titlePrefix: 0,
  titleInside: 1,
  artistPrefix: 2,
  artistInside: 3,
} as const;

/**
 * Saran dibatasi 6 baris (design.md 8.2), dan mencari di judul maupun nama
 * artis. Mengetik nama artis mengembalikan lagu-lagu artis itu, karena pemain
 * sering ingat siapa yang menyanyi sebelum ingat judulnya.
 */
export function suggest(
  query: string,
  pool: readonly CatalogSong[],
  limit = 6,
): Suggestion[] {
  const needle = normalize(query);
  if (needle.length < 2) return [];

  const rawNeedle = query.trim().toLowerCase();

  const hits: { suggestion: Suggestion; rank: number }[] = [];

  for (const song of pool) {
    let best: { rank: number; title: string } | null = null;

    for (const title of titlesOf(song)) {
      const at = flexibleIndexOf(title, query);
      if (at === -1) continue;
      const rank = at === 0 ? RANK.titlePrefix : RANK.titleInside;
      if (!best || rank < best.rank) best = { rank, title };
    }

    const artistAt = flexibleIndexOf(song.artist, query);
    if (!best && artistAt !== -1) {
      best = {
        rank: artistAt === 0 ? RANK.artistPrefix : RANK.artistInside,
        title: song.title,
      };
    }

    if (!best) continue;

    const matchedOnTitle = best.rank <= RANK.titleInside;
    hits.push({
      rank: best.rank,
      suggestion: {
        song,
        matchedTitle: best.title,
        titleHighlight: matchedOnTitle ? highlightOf(best.title, rawNeedle) : null,
        artistHighlight: matchedOnTitle
          ? null
          : highlightOf(song.artist, rawNeedle),
      },
    });
  }

  hits.sort(
    (a, b) =>
      a.rank - b.rank ||
      // Di dalam satu artis, urutan judul dibuat stabil supaya daftar tidak
      // berubah urutan di antara dua ketukan tombol.
      a.suggestion.song.artist.localeCompare(b.suggestion.song.artist) ||
      a.suggestion.matchedTitle.localeCompare(b.suggestion.matchedTitle),
  );
  return hits.slice(0, limit).map((hit) => hit.suggestion);
}
