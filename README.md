# TebakLagu

Game tebak judul lagu dari klip audio sangat singkat. Klip pertama 0,1 detik, lalu bertambah ke 0,5s, 2s, 8s, dan 15s setiap kali tebakan salah atau dilewati.

Dokumen acuan: `PRD.md` (apa yang dibangun) dan `design.md` (bagaimana tampilannya, beserta alasannya). Keduanya adalah sumber kebenaran; kode ini mengikutinya, bukan sebaliknya.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
```

Tidak ada variabel lingkungan yang perlu diisi. Data lagu dan preview diambil saat bermain dari iTunes Search API, dan tidak ada audio yang di-host atau di-cache di sisi ini.

## Memverifikasi

```bash
npm run verify     # locales, kontras, unit test, typecheck, lint, build
```

Isinya, dan alasan masing-masing ada:

| Perintah | Yang diperiksa |
|---|---|
| `npm run check:locales` | Set key `locales/id.json` dan `locales/en.json` identik, variabel interpolasinya sama, dan tidak ada em dash maupun emoji di nilai mana pun. |
| `npm run check:contrast` | Rasio kontras WCAG untuk 30 pasangan warna yang benar-benar dipakai, di tema gelap dan terang. Gagal kalau satu pasangan turun di bawah ambangnya. |
| `npm test` | Pencocokan jawaban (typo, judul alternatif, judul pendek), pola teks share, dan allowlist host proxy audio. |
| `npm run typecheck` | TypeScript mode strict, termasuk `noUncheckedIndexedAccess`. |
| `npm run lint` | ESLint dengan aturan Next. |

Klik-through browser dijalankan terpisah karena butuh server yang hidup:

```bash
npm run build && npx next start -p 3100
node scripts/clickthrough.mjs http://localhost:3100
```

Skrip itu menekan setiap kontrol satu per satu di Microsoft Edge dan mencatat hasilnya: pemutaran klip, autocomplete lewat mouse dan keyboard, tebakan salah, skip, nyerah, panel reveal, share ke clipboard, drawer, kedua tema, kedua bahasa, kedua layout, enam lebar viewport, target sentuh di 320px, dan dosis blur, shadow, serta animasi.

## Struktur

```
locales/              id.json dan en.json, satu-satunya tempat teks UI tinggal
src/app/              rute App Router, token desain di globals.css
src/app/api/song/     menyelesaikan lagu katalog jadi data yang bisa diputar
src/app/api/clip/     proxy audio preview, hanya menerima trackId numerik
src/components/       komponen UI
src/data/songs.json   katalog seed, dikurasi manual
src/lib/              katalog, pencocokan, mesin audio, aturan game, statistik
scripts/              pemeriksaan yang dijalankan verify dan klik-through
tests/                unit test dengan test runner bawaan Node
```

## Catatan keadaan saat ini

- **Katalog masih seed, tapi sudah mendekati target.** `src/data/songs.json` berisi 283 lagu: 173 Indonesia (pop 101, rock dan indie 45, dangdut 27) dan 110 internasional (pop 58, K-pop 31, hip-hop 21). Target PRD Fase 1 adalah sekitar 200 lagu Indonesia dan 100 internasional, jadi sisi internasional sudah terlampaui dan sisi Indonesia masih kurang sekitar 27 lagu. Jumlah yang ditampilkan di aplikasi selalu dihitung dari isi file, bukan ditulis tangan.
- **Logo dan favicon masih penanda sementara.** `src/app/icon.svg` memakai bentuk yang ditetapkan `design.md` Bagian 13 sebagai pengganti sampai pemilik produk memutuskan logo final.
- **Mode harian belum ada.** "Lagu Hari Ini" adalah Fase 2 di PRD, dan rutenya belum dibangun, jadi tidak ada tautan ke sana di mana pun.
- **Dua kerentanan dev-time** dilaporkan `npm audit`, keduanya di dependensi transitif perkakas pengembangan (`braces` lewat `eslint-config-next`, dan `postcss` lewat `@tailwindcss/postcss`). Belum ada versi perbaikan di dalam rentang yang dipakai, dan keduanya tidak ikut ke bundel produksi.

## Lisensi dan hak

Rekaman yang diputar adalah preview resmi milik pemegang haknya masing-masing, bukan milik proyek ini. Lihat `/ketentuan` di aplikasi.
