import { NextResponse } from "next/server";
import { isAllowedAudioUrl, lookupPreviewUrl } from "@/lib/itunes";

/**
 * Proxy audio preview. Ada dua alasan route ini wajib:
 *
 * 1. Web Audio API butuh fetch plus decodeAudioData, dan itu butuh CORS yang
 *    tidak dijamin oleh sumbernya (PRD bagian 7.2).
 * 2. Tanpa proxy, browser pemain menghubungi Apple langsung, yang membuat
 *    pernyataan di halaman Privasi tidak benar lagi.
 *
 * Route ini hanya menerima trackId numerik, bukan URL. Lihat catatan keamanan
 * di isAllowedAudioUrl: menerima URL dari klien akan menjadikannya open proxy.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ trackId: string }> },
) {
  const { trackId } = await params;

  if (!/^\d{1,12}$/.test(trackId)) {
    return NextResponse.json({ error: "bad-track-id" }, { status: 400 });
  }

  let previewUrl: string | null;
  try {
    previewUrl = await lookupPreviewUrl(Number(trackId));
  } catch {
    return NextResponse.json({ error: "upstream-failed" }, { status: 502 });
  }

  if (!previewUrl) {
    return NextResponse.json({ error: "no-preview" }, { status: 404 });
  }

  if (!isAllowedAudioUrl(previewUrl)) {
    return NextResponse.json({ error: "blocked-host" }, { status: 502 });
  }

  const upstream = await fetch(previewUrl, {
    signal: AbortSignal.timeout(15000),
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "upstream-failed" }, { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "audio/mp4",
      // Tidak disimpan di sisi mana pun: ToS penyedia melarang caching permanen.
      "Cache-Control": "no-store",
      "Content-Length": upstream.headers.get("content-length") ?? "",
    },
  });
}
