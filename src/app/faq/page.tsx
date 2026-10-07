import type { Metadata } from "next";
import { FaqView } from "@/components/faq-view";

export const metadata: Metadata = {
  title: "Pertanyaan soal TebakLagu",
  description:
    "Kenapa klipnya 0,1 detik, kenapa ada lagu yang nggak ada di katalog, kenapa streak ilang pas ganti HP, dan kenapa suara nggak keluar di HP.",
};

export default function FaqPage() {
  return <FaqView />;
}
