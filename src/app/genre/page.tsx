import type { Metadata } from "next";
import { GenreIndexView } from "@/components/genre-views";

export const metadata: Metadata = {
  title: "Pilih genre: TebakLagu",
  description:
    "Pop Indonesia, dangdut, rock dan indie Indonesia, pop internasional, hip-hop, dan K-pop. Tiap genre langsung buka game dengan filternya kepasang.",
};

export default function GenreIndexPage() {
  return <GenreIndexView />;
}
