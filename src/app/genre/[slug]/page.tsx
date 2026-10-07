import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GenreGameView } from "@/components/genre-views";
import { GENRE_IDS, type GenreId } from "@/lib/catalog-types";

const LABELS: Record<GenreId, string> = {
  "pop-id": "Pop Indonesia",
  dangdut: "Dangdut",
  "rock-indie-id": "Rock dan indie Indonesia",
  "pop-intl": "Pop internasional",
  "hip-hop": "Hip-hop",
  "k-pop": "K-pop",
};

function isGenre(value: string): value is GenreId {
  return (GENRE_IDS as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return GENRE_IDS.map((genre) => ({ slug: genre }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isGenre(slug)) return { title: "TebakLagu" };
  return {
    title: `Tebak lagu ${LABELS[slug]}: TebakLagu`,
    description: `Tebak judul lagu ${LABELS[slug]} dari klip 0,1 detik. Gratis, tanpa akun.`,
  };
}

export default async function GenrePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isGenre(slug)) notFound();
  return <GenreGameView genre={slug} />;
}
