import type { Metadata } from "next";
import { PrivacyView } from "@/components/legal-views";

export const metadata: Metadata = {
  title: "Kebijakan Privasi: TebakLagu",
  description:
    "TebakLagu nggak punya akun dan nggak ngumpulin data pribadi. Pilihan dan statistik disimpan di browser kamu sendiri.",
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
