import { NextResponse } from "next/server";
import { CATALOG } from "@/lib/catalog";
import { findPreview } from "@/lib/itunes";

/**
 * Menyelesaikan satu lagu katalog menjadi data yang bisa diputar.
 *
 * Klien tidak pernah menerima URL Apple secara langsung: yang dikirim balik
 * adalah jalur proxy milik kita sendiri. Itu yang membuat pernyataan di
 * halaman Privasi benar, bahwa alamat pemain tidak sampai ke pihak ketiga.
 *
 * Soal status: lagu yang ada di katalog tapi tidak punya preview resmi dijawab
 * 200 dengan `playable: false`, bukan 404. Sumber dayanya memang ada, yang
 * tidak ada hanya previewnya, dan 404 untuk kondisi yang sudah ditangani hanya
 * menimbulkan error di konsol pemain untuk sesuatu yang bukan kesalahan.
 * 404 disimpan untuk id yang benar-benar tidak ada di katalog.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const song = CATALOG.find((entry) => entry.id === id);

  if (!song) {
    return NextResponse.json({ error: "unknown-song" }, { status: 404 });
  }

  try {
    const track = await findPreview(song);
    if (!track) {
      return NextResponse.json(
        { id: song.id, playable: false, reason: "no-preview" },
        { headers: { "Cache-Control": "public, max-age=300, s-maxage=600" } },
      );
    }

    return NextResponse.json(
      {
        id: song.id,
        playable: true,
        itunesTrackId: track.trackId,
        clipUrl: `/api/clip/${track.trackId}`,
        artworkUrl: track.artworkUrl,
      },
      {
        headers: {
          // Metadata boleh singgah sebentar di CDN, audionya tidak.
          "Cache-Control": "public, max-age=300, s-maxage=600",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "upstream-failed" }, { status: 502 });
  }
}
