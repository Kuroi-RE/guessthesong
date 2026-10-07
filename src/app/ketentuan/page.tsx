import type { Metadata } from "next";
import { TermsView } from "@/components/legal-views";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan: TebakLagu",
  description:
    "Ketentuan pemakaian TebakLagu, termasuk soal audio preview resmi dari pihak ketiga dan ketersediaan layanan.",
};

export default function TermsPage() {
  return <TermsView />;
}
