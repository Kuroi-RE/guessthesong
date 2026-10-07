import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

// Plus Jakarta Sans dipilih karena asal dan bentuknya, bukan karena default:
// huruf buatan studio tipe Indonesia, dan x-height-nya menjaga keterbacaan
// pada 14px di HP (design.md 4.1).
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

// Monospace dipakai karena fungsi, bukan estetika terminal: durasi dan riwayat
// tersusun sebagai kolom angka yang harus rata (design.md 4.1).
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TebakLagu: tebak lagunya cuma dari 0,1 detik",
  description:
    "Game tebak judul lagu gratis. Dengerin klip 0,1 detik, tebak judulnya, dan buka klip lebih panjang cuma kalau butuh. Katalog lagu Indonesia dan internasional.",
  applicationName: "TebakLagu",
  authors: [{ name: "Sharam" }],
  openGraph: {
    title: "TebakLagu: tebak lagunya cuma dari 0,1 detik",
    description:
      "Dengerin klip 0,1 detik, tebak judulnya. Klip nambah tiap kali salah.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pembesaran tidak dikunci: mengunci zoom adalah hambatan aksesibilitas.
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0b0a" },
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
  ],
};

/**
 * Tema dipasang sebelum paint pertama. Tanpa ini, pemain yang memilih tema
 * terang akan melihat kedipan gelap di setiap kali pindah halaman, dan itu
 * cacat yang paling terasa justru pada pilihan yang dia sendiri buat.
 */
const themeBootstrap = `
(function(){
  try {
    var raw = localStorage.getItem('tebaklagu.settings.v1');
    var choice = raw ? (JSON.parse(raw).theme || 'system') : 'system';
    var light = choice === 'light' || (choice === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={`${jakarta.variable} ${plexMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
