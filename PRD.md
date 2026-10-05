# PRD — Website Tebak Judul Lagu ("TebakLagu")

**Versi:** 1.0
**Tanggal:** 2026-10-04
**Status:** Draft
**Pemilik Produk:** (isi nama)

---

## 1. Ringkasan Produk

TebakLagu adalah game web gratis bergaya *Heardle* di mana pemain mendengar potongan audio sangat singkat (mulai 0.1 detik) lalu menebak judul lagunya. Jika salah atau menyerah, durasi klip bertambah bertahap (0.5s → 2s → 8s → 15s). Produk ini terinspirasi dari [songspot.net](https://songspot.net), tetapi difokuskan untuk pasar Indonesia dengan katalog lagu lokal dan **dukungan dua bahasa (Inggris & Indonesia)**.

### Tujuan
- Menyediakan game tebak lagu yang ringan, cepat, dan bisa dimainkan tanpa akun.
- Mengutamakan katalog lagu Indonesia (pop, dangdut, indie, rock, lagu nostalgia).
- Mendukung antarmuka dua bahasa dengan gaya bahasa Indonesia **nonformal/santai**.

### Non-Tujuan (Out of Scope v1)
- Pemutaran lagu penuh (hanya preview legal dari API pihak ketiga).
- Fitur sosial kompleks (chat, friend list, leaderboard global real-time).
- Aplikasi mobile native (fokus web dulu, tetapi responsif).

---

## 2. Target Pengguna

| Segmen | Deskripsi | Kebutuhan |
|---|---|---|
| Gen Z & Milenial Indonesia | Suka musik, kuis, konten TikTok | Game cepat, bisa di-share, lagu yang relatable |
| Penggemar musik internasional | Main untuk tantangan | Pilihan genre & era global |
| Pembuat konten | Rekam reaksi menebak lagu | Mode layout "tight" untuk video vertikal |

---

## 3. User Stories

- Sebagai pemain, saya ingin menekan tombol putar dan mendengar klip singkat, agar bisa langsung menebak.
- Sebagai pemain, saya ingin mengetik tebakan dengan bantuan autocomplete, agar tidak salah ketik judul.
- Sebagai pemain, saya ingin klip bertambah panjang setiap kali salah/skip, agar punya kesempatan lebih.
- Sebagai pemain, saya ingin memilih genre, era, dan tingkat kesulitan, agar sesuai selera.
- Sebagai pemain, saya ingin membagikan hasil tebakan (pola kotak), agar bisa pamer ke teman.
- Sebagai pemain, saya ingin **mengganti bahasa antara Inggris dan Indonesia**, agar nyaman dengan bahasa saya.
- Sebagai pemain Indonesia, saya ingin teks terasa **santai/nonformal**, bukan kaku.

---

## 4. Fitur & Requirement

### 4.1 Core Gameplay
- **R-01** Pemutaran klip bertahap: 0.1s → 0.5s → 2s → 8s → 15s (konfigurasikan di menu).
- **R-02** Maksimal 5–6 kali tebakan per lagu.
- **R-03** Tombol: Putar, Lewati (Skip), Tebak (Submit), Menyerah (Give up).
- **R-04** Input tebakan dengan **autocomplete** judul lagu dari katalog.
- **R-05** Pencocokan jawaban *fuzzy* (toleransi typo, abaikan huruf besar/kecil & tanda baca, dukung judul alternatif).
- **R-06** Setelah selesai (menang/kalah): tampilkan reveal (judul, artis, cover), tombol main lagi & bagikan.

### 4.2 Filter & Mode
- **R-07** Filter genre: Pop Indonesia, Dangdut, Rock/Indie Indonesia, Pop Internasional, Hip-Hop, K-Pop, dll.
- **R-08** Filter era: Klasik (<2000), 2000-an, 2010-an, 2020-an.
- **R-09** Tingkat kesulitan: Easy, Medium, Hard, Expert, Impossible (memengaruhi popularitas lagu & durasi awal).
- **R-10** Mode harian ("Lagu Hari Ini" — sama untuk semua pemain) & mode bebas (tanpa batas).

### 4.3 Statistik & Share
- **R-11** Streak (rentetan menang), total main, win rate, distribusi tebakan — disimpan di `localStorage`.
- **R-12** Bagikan hasil berupa pola emoji/kotak tanpa membocorkan judul.

### 4.4 Fitur Bahasa (i18n) — *(Tambahan utama dari requirement)*
- **R-13** Dukungan dua bahasa: **English (`en`)** dan **Indonesia (`id`)**.
- **R-14** Toggle bahasa di header/menu; pilihan disimpan di `localStorage`.
- **R-15** Semua teks UI diambil dari file **JSON terjemahan** (lihat Bagian 6), bukan hardcoded.
- **R-16** Bahasa Indonesia menggunakan gaya **nonformal/santai** (contoh: "Ayo tebak!", "Yah, salah 😅", bukan "Silakan masukkan jawaban Anda").
- **R-17** Deteksi bahasa default dari browser (`navigator.language`); fallback ke `en`.
- **R-18** Struktur JSON memakai key yang sama untuk kedua bahasa (contoh: `"world"` → `en: "world"`, `id: "dunia"`), agar developer mudah menambah/menerjemahkan string.

### 4.5 Opsi Tampilan (UI)
- **R-19** Layout "wide" (default) & "tight" (untuk konten TikTok/vertikal).
- **R-20** Kontrol volume & opsi playback (dari awal / dari bagian lain lagu).
- **R-21** Responsif untuk HP, tablet, desktop.

---

## 5. Alur Pengguna (User Flow)

```
Buka web
  → Pilih bahasa (auto-deteksi, bisa diubah)
  → Pilih mode (Harian / Bebas) + filter genre/era/difficulty
  → Tekan "Putar" → dengar 0.1s
  → Ketik tebakan (autocomplete)
     ├─ Benar → Reveal + Statistik + Share
     └─ Salah/Skip → klip nambah (0.5s → 2s → ...) → ulang
  → Setelah 5-6x gagal → Reveal jawaban
  → "Main Lagi" / "Bagikan"
```

---

## 6. Spesifikasi Teknis i18n (JSON)

### 6.1 Struktur File
Setiap bahasa punya satu file JSON di folder `locales/`:

```
/locales
  ├── en.json
  └── id.json
```

### 6.2 Contoh `en.json`
```json
{
  "common": {
    "world": "world",
    "play": "Play",
    "skip": "Skip",
    "guess": "Guess",
    "giveUp": "Give up",
    "playAgain": "Play again",
    "share": "Share result"
  },
  "game": {
    "title": "Guess the song in 0.1 seconds",
    "placeholder": "Type the song title...",
    "correct": "Nailed it! 🎉",
    "wrong": "Nope, try again",
    "revealTitle": "The song was:",
    "attemptsLeft": "{count} guesses left"
  },
  "settings": {
    "language": "Language",
    "genre": "Genre",
    "era": "Era",
    "difficulty": "Difficulty"
  }
}
```

### 6.3 Contoh `id.json` (gaya nonformal/santai)
```json
{
  "common": {
    "world": "dunia",
    "play": "Putar",
    "skip": "Lewatin",
    "guess": "Tebak",
    "giveUp": "Nyerah",
    "playAgain": "Main lagi",
    "share": "Bagiin hasil"
  },
  "game": {
    "title": "Tebak lagunya cuma dari 0.1 detik!",
    "placeholder": "Ketik judul lagunya di sini...",
    "correct": "Mantap, bener! 🎉",
    "wrong": "Yah, salah 😅 coba lagi",
    "revealTitle": "Lagunya tadi:",
    "attemptsLeft": "Sisa {count} tebakan"
  },
  "settings": {
    "language": "Bahasa",
    "genre": "Genre",
    "era": "Era",
    "difficulty": "Tingkat kesulitan"
  }
}
```

### 6.4 Aturan i18n
- Key **harus identik** di kedua file; hanya value yang berbeda.
- Mendukung interpolasi variabel (contoh `{count}`).
- String baru **wajib** ditambahkan ke KEDUA file (`en.json` & `id.json`) saat development.
- Gaya Indonesia: santai, boleh pakai emoji, hindari kata baku kaku ("Anda" → "kamu", "silakan" → "ayo/yuk").
- Rekomendasi library: `i18next` / `react-i18next` (React/Next.js) atau `vue-i18n` (Vue).

---

## 7. Arsitektur Teknis

### 7.1 Stack yang Direkomendasikan
| Komponen | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js + React | SEO, SSR, fullstack, mudah i18n |
| Styling | Tailwind CSS | Cepat, konsisten, responsif |
| i18n | react-i18next | Standar industri, dukung JSON |
| Audio playback | Web Audio API | Pemutaran klip presisi (0.1s) |
| Sumber audio | iTunes Search API / Deezer API | Gratis, preview 30s masih tersedia |
| Database | PostgreSQL (atau JSON statik utk MVP) | Katalog lagu & metadata |
| Hosting | Vercel | Deploy mudah untuk Next.js |

> **Catatan penting:** Spotify Web API **tidak lagi menyediakan `preview_url`** untuk app baru (sejak 27 Nov 2024), jadi audio diambil dari **iTunes Search API** atau **Deezer API**. Spotify hanya opsional untuk metadata/cover.

### 7.2 Catatan Audio & CORS
- Web Audio API butuh `fetch()` + `decodeAudioData()`; sumber audio harus mengizinkan **CORS**.
- Jika diblokir, salurkan lewat **proxy backend** sendiri.
- `AudioContext` harus di-resume setelah interaksi user (klik) — penting untuk mobile.

---

## 8. Pertimbangan Legal

- **Hak cipta audio adalah risiko utama.** Hanya putar **preview resmi** dari API pihak ketiga (iTunes/Deezer); **jangan** menyimpan/host file audio penuh sendiri.
- Patuhi Terms of Service penyedia API (larangan caching permanen, dsb.).
- Sediakan halaman **Kebijakan Privasi** & **Syarat & Ketentuan**.
- Tampilkan atribusi sumber bila diwajibkan API.

---

## 9. Metrik Keberhasilan (KPI)

- Jumlah pemain harian (DAU) & sesi per pemain.
- Rata-rata lagu dimainkan per sesi.
- Tingkat retensi (streak yang berlanjut antar kunjungan).
- Jumlah share hasil.
- Rasio pemilihan bahasa (en vs id) untuk validasi fitur i18n.

---

## 10. Roadmap Bertahap

### Fase 1 — MVP
- Core gameplay (putar bertahap, tebak, reveal).
- Sumber audio iTunes API + Web Audio API.
- i18n EN/ID dengan JSON.
- Katalog awal ~200 lagu Indonesia + 100 internasional (JSON statik).
- Statistik lokal (localStorage) + share.

### Fase 2
- Mode harian ("Lagu Hari Ini").
- Filter genre/era/difficulty lengkap.
- Database (PostgreSQL) + panel admin tambah lagu.
- Layout "tight" untuk konten vertikal.

### Fase 3
- Tantang teman (kirim lagu spesifik via link).
- Leaderboard, akun opsional, sinkronisasi antar perangkat.
- Monetisasi (iklan/donasi).

---

## 11. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Preview audio API dihentikan/diubah | Tinggi | Dukung multi-sumber (iTunes + Deezer), abstraksi layer audio |
| Masalah CORS audio | Sedang | Proxy backend sendiri |
| Klaim hak cipta | Tinggi | Hanya preview resmi, tanpa host file |
| Katalog lagu kurang relevan | Sedang | Kurasi manual lagu Indonesia populer |
| Terjemahan tidak konsisten | Rendah | Validasi key JSON otomatis saat build |
