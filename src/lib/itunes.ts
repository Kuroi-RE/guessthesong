import type { CatalogSong } from "./catalog-types";

const SEARCH_ENDPOINT = "https://itunes.apple.com/search";
const LOOKUP_ENDPOINT = "https://itunes.apple.com/lookup";

/**
 * Host yang diizinkan untuk audio preview.
 *
 * Preview audio disajikan dari `audio-ssl.itunes.apple.com` (dan secara
 * historis dari host `*-ssl.itunes.apple.com` lain), sedangkan cover art ada
 * di `*.mzstatic.com`. Keduanya CDN milik Apple dan preview pernah berpindah
 * antar keduanya, jadi keduanya diizinkan, tapi hanya sebagai sufiks yang
 * pasti, bukan sebagai pencocokan longgar yang bisa dilewati host seperti
 * "mzstatic.com.penyerang.net".
 */
const ALLOWED_AUDIO_SUFFIXES = [".itunes.apple.com", ".mzstatic.com"];

export interface ItunesTrack {
  trackId: number;
  previewUrl: string;
  artworkUrl: string | null;
  trackName: string;
  artistName: string;
}

interface ItunesRawTrack {
  trackId?: number;
  previewUrl?: string;
  artworkUrl100?: string;
  trackName?: string;
  artistName?: string;
  kind?: string;
}

/**
 * Cache metadata di memori proses, umur pendek.
 * Sengaja tidak permanen dan tidak pernah menyentuh audionya: ToS penyedia
 * preview melarang caching permanen (PRD bagian 8).
 */
const TTL_MS = 10 * 60 * 1000;
const metaCache = new Map<string, { at: number; track: ItunesTrack | null }>();

function fromCache(key: string): ItunesTrack | null | undefined {
  const hit = metaCache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > TTL_MS) {
    metaCache.delete(key);
    return undefined;
  }
  return hit.track;
}

function pickTrack(
  results: ItunesRawTrack[],
  song: CatalogSong,
): ItunesTrack | null {
  const wanted = song.artist.toLowerCase();
  const candidates = results.filter(
    (item) => item.kind === "song" && typeof item.previewUrl === "string",
  );

  // Hasil pencarian iTunes sering memuat versi cover dan karaoke dengan judul
  // yang sama, jadi nama artis dicocokkan lebih dulu sebelum urutan relevansi.
  const byArtist = candidates.find((item) =>
    (item.artistName ?? "").toLowerCase().includes(wanted),
  );
  const chosen = byArtist ?? candidates[0];
  if (!chosen || !chosen.previewUrl || typeof chosen.trackId !== "number") {
    return null;
  }

  return {
    trackId: chosen.trackId,
    previewUrl: chosen.previewUrl,
    // Artwork 100px diganti ke 300px: ukuran panel reveal 96px pada layar 3x.
    artworkUrl: chosen.artworkUrl100
      ? chosen.artworkUrl100.replace("100x100bb", "300x300bb")
      : null,
    trackName: chosen.trackName ?? song.title,
    artistName: chosen.artistName ?? song.artist,
  };
}

export async function findPreview(
  song: CatalogSong,
): Promise<ItunesTrack | null> {
  const key = `song:${song.id}`;
  const cached = fromCache(key);
  if (cached !== undefined) return cached;

  const term = song.searchTerm ?? `${song.artist} ${song.title}`;
  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.set("term", term);
  url.searchParams.set("media", "music");
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "12");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`itunes search ${response.status}`);
  }

  const payload = (await response.json()) as { results?: ItunesRawTrack[] };
  const track = pickTrack(payload.results ?? [], song);
  metaCache.set(key, { at: Date.now(), track });
  return track;
}

export async function lookupPreviewUrl(
  trackId: number,
): Promise<string | null> {
  const key = `track:${trackId}`;
  const cached = fromCache(key);
  if (cached !== undefined) return cached?.previewUrl ?? null;

  const url = new URL(LOOKUP_ENDPOINT);
  url.searchParams.set("id", String(trackId));

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`itunes lookup ${response.status}`);

  const payload = (await response.json()) as { results?: ItunesRawTrack[] };
  const first = payload.results?.[0];
  if (!first?.previewUrl || typeof first.trackId !== "number") {
    metaCache.set(key, { at: Date.now(), track: null });
    return null;
  }

  metaCache.set(key, {
    at: Date.now(),
    track: {
      trackId: first.trackId,
      previewUrl: first.previewUrl,
      artworkUrl: first.artworkUrl100 ?? null,
      trackName: first.trackName ?? "",
      artistName: first.artistName ?? "",
    },
  });
  return first.previewUrl;
}

/**
 * Catatan keamanan: proxy audio tidak pernah menerima URL dari klien.
 * Klien hanya mengirim trackId numerik, server yang menyelesaikannya jadi URL,
 * lalu host hasilnya diperiksa di sini. Tanpa pemeriksaan ini, route proxy
 * akan jadi open proxy yang bisa dipakai menembak alamat internal.
 */
export function isAllowedAudioUrl(candidate: string): boolean {
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return ALLOWED_AUDIO_SUFFIXES.some((suffix) => host.endsWith(suffix));
  } catch {
    return false;
  }
}
