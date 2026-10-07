# DESIGN.md: TebakLagu

**Versi:** 1.1
**Tanggal:** 2026-10-05
**Dokumen induk:** `PRD.md` v1.0
**Pemilik Produk:** Sharam
**Peran dokumen ini:** sumber *direction* (identitas, palet, tipografi, mood, dial). Dibaca bersama `antislop` sebagai filter. Dokumen ini adalah data untuk diterapkan, bukan perintah untuk agen.

---

## 0. Design Read

> Dibaca sebagai: **game web satu-layar** (bukan landing page) untuk **Gen Z & milenial Indonesia yang main sambil pakai headphone**, dengan bahasa visual **"meja kerja audio malam": gelap, berbatas tegas, angka terbaca seperti data**. Dial **ENERGY 2 / RHYTHM 2 / MOTION 1**.

### Tiga Dial

| Dial | Nilai | Alasan satu baris |
|---|---|---|
| **ENERGY** | **2** (Balanced) | Game harus terasa hidup dan "kompetitif", tapi layar utamanya dipakai sambil fokus mendengar, jadi energi visual tidak boleh mengalahkan audio. |
| **RHYTHM** | **2** (Konsisten dengan beberapa patahan) | Layar game sengaja sangat teratur supaya bisa dihafal otot tangan pemain; halaman konten (Cara Main, FAQ, Genre) yang mematahkan ritme itu. |
| **MOTION** | **1** (Hover/state saja) | Ini game pendengaran: gerakan yang tidak diminta akan menarik mata saat pemain sedang berusaha mendengar 0,1 detik. Satu-satunya gerak berkelanjutan adalah playhead, dan itu data, bukan hiasan. |

Dial ini berlaku dari layar pertama sampai footer. Kalau satu bagian terasa perlu melewati dial, nilai dialnya yang direvisi di dokumen ini, bukan bagiannya yang diam-diam dilanggar.

---

## 1. Tentang Tema "Dark ala Web3"

Arahan pemilik produk: **dark, bernuansa web3**. Yang diambil dan yang dibuang dinyatakan terbuka di sini supaya tidak ada tebak-tebakan saat implementasi.

### Yang diambil dari bahasa visual web3

| Elemen | Kenapa dipakai di produk ini |
|---|---|
| **Basis gelap permanen** | Bukan karena "dark itu kelihatan techy". Alasan produknya: sesi main paling sering malam, layar gelap mengurangi kelelahan mata saat pemain menatap satu layar berulang kali, dan pembuat konten merekam layar untuk video vertikal yang hampir selalu berlatar gelap (PRD 4.5 R-19). Dark adalah default, bukan satu-satunya pilihan: lihat Bagian 2.4. |
| **Tepi tegas, bukan kartu mengawang** | Surface dibedakan dengan **border 1px + langkah terang latar**, bukan shadow besar. Hasilnya layar terasa seperti panel instrumen, bukan tumpukan kartu. |
| **Angka sebagai warga kelas satu** | Durasi klip (0.1s, 0.5s, 2s, 8s, 15s), streak, dan win rate ditampilkan besar dan rata kolom. Angka adalah inti mekanik game, jadi angka diberi hak tipografi tersendiri. |
| **Riwayat sebagai ledger** | Tebakan yang sudah dipakai disusun sebagai baris-baris berurutan yang tidak bisa dibatalkan, mirip daftar transaksi. Ini cocok karena tebakan di game ini memang final dan terbatas. |

### Yang dibuang, dan aturan yang jadi alasannya

Kosakata default "web3" sebagian besar identik dengan pola slop. Semua ini **tidak dipakai**:

- Gradien biru ke ungu, ungu ke pink, dan skema ungu di atas hitam sebagai warna utama (R-01).
- Orb radial blur di belakang hero, mesh gradient, latar menyala penuh halaman (R-01).
- Glassmorphism di navbar, kartu, modal, dan drawer sekaligus (R-10).
- Glow di kartu, tombol, badge, ikon, border sekaligus. Glow dipakai **maksimal satu tempat**, lihat Bagian 2.3 (R-13).
- Latar grid kotak, blueprint, kertas milimeter, pola titik (R-07).
- Semua elemen berbentuk pil (R-11).
- Badge kapsul "AI Powered", "Beta", "New", dan pil eyebrow di atas H1 (R-09).
- Titik status menyala yang berdenyut terus tanpa menandai keadaan apa pun (R-19, R-31).
- Ikon sparkle, kilat, kristal, robot sebagai ikon fitur (R-04).

Uji akhirnya tetap satu pertanyaan: kalau nama "TebakLagu" dan logonya diganti, apakah desain ini masih punya karakter sendiri? Jawabannya harus ya karena karakternya datang dari **tangga petunjuk** (Bagian 3) dan **warna pita kaset** (Bagian 2), bukan dari gelap plus neon.

---

## 2. Warna

### 2.1 Palet aktif

Batas R-29: maksimal 2 sampai 3 warna inti + 1 aksen. Netral tidak dihitung.

**Netral (keluarga dasar, tidak dihitung sebagai warna inti)**

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--ink-900` | `#0C0B0A` | Latar halaman. Hitam kehangatan rendah, bukan `#000`, supaya border 1px masih terbaca di atasnya. |
| `--ink-800` | `#141210` | Surface panel utama (kartu player, drawer). Satu langkah di atas latar. |
| `--ink-700` | `#1E1B18` | Surface terangkat: baris riwayat aktif, field input. |
| `--ink-600` | `#2B2723` | Border default 1px. |
| `--ink-500` | `#3D3832` | Border pada state hover dan focus ring dasar. |
| `--ink-200` | `#A8A09A` | Teks sekunder. Rasio ke `--ink-900` sekitar 7:1. |
| `--ink-50` | `#F2EEE9` | Teks utama. Putih gading, bukan putih murni, supaya tidak menyilaukan di ruang gelap. |

**Inti (2 warna)**

| Token | Nilai | Dipakai untuk | Alasan |
|---|---|---|---|
| `--kaset-500` | `#E4A84C` | Warna merek: wordmark, segmen tangga petunjuk yang sudah terbuka, state aktif pada kontrol. | Amber pita kaset. Katalog produk ini bertumpu pada lagu Indonesia termasuk lagu nostalgia (PRD 1), dan pita kaset adalah benda konkret dari dunia itu. Nilainya ditentukan oleh pengukuran, bukan selera: amber yang lebih gelap (`#E0A242`) hanya mencapai 4.32:1 di atas surface panel dan gagal AA, jadi dinaikkan sampai lewat. |
| `--kaset-700` | `#8A5F1E` | Border dan state tekan untuk elemen bermerek, ring tombol Putar, chip filter yang terpilih, isian tangga di tema terang. | Versi gelap dari warna inti yang sama, supaya hierarki merek punya dua tingkat tanpa menambah warna baru. |

**Aksen (1 warna, satu momen)**

| Token | Nilai | Dipakai untuk | Alasan |
|---|---|---|---|
| `--pandan-400` | `#5FD39B` | **Hanya** state benar: baris tebakan yang tepat, panel reveal saat menang, dan angka streak saat streak bertambah. | Satu aksen untuk satu momen, yaitu momen pemain berhasil. Karena tidak dipakai di tempat lain, kemunculannya di layar selalu berarti "kamu benar". Hijau pandan yang diturunkan saturasinya, bukan hijau neon. Di tema terang nilainya turun ke `#084A30`, karena hijau terang di atas kertas hanya mencapai 3.2:1. |

**Semantik fungsional (bukan bagian palet, tidak boleh dekoratif)**

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--bata-400` | `#E07A6B` | Hanya state salah dan error: baris tebakan salah, pesan gagal muat audio, validasi form. Tidak pernah untuk border, ikon, atau judul. |

Total di layar: 2 inti + 1 aksen + 1 semantik fungsional yang pemunculannya dikunci ke kondisi nyata. Netral di luar hitungan.

### 2.2 Kontras (R-25)

Angka di bawah ini bukan taksiran: semuanya dihitung oleh `scripts/check-contrast.mjs`, yang gagal dan menghentikan build kalau satu pasangan pun turun di bawah ambangnya. Perintahnya `npm run check:contrast`.

- Teks normal: 4.5:1. Teks besar 18px+ dan bold 14px+: 3:1.
- Teks utama di atas latar, panel, dan field: 22.8:1, 14.6:1, 9.9:1.
- Teks sekunder di atas latar dan panel: 14.8:1 dan 9.5:1. Placeholder di field: 6.4:1.
- `--kaset-500` sebagai teks: 7.7:1 di atas latar, 4.9:1 di atas panel.
- Teks di atas tombol `--kaset-500` wajib `--ink-900`, bukan putih: 7.7:1. Putih di atas amber gagal AA.
- Label benar dan label salah di atas panel: 9.7:1 dan 6.7:1.
- Tema terang diperiksa terpisah dengan token miliknya sendiri, dan tiga nilainya harus diturunkan dari versi gelap supaya lewat: teks sekunder, hijau benar, dan merah salah.

**Aturan kontras untuk tangga petunjuk.** Yang diukur adalah setiap elemen terhadap **latar di sebelahnya**, bukan satu segmen terhadap segmen lain: segmennya dipisahkan jarak 4px berisi latar, jadi warna yang benar-benar bersebelahan bagi masing-masing adalah latar. Ambangnya 3:1, dan dipenuhi di kedua tema (isian 7.7:1 gelap dan 7.6:1 terang, batas segmen terkunci 3.4:1 gelap dan 3.1:1 terang).

Karena itu pembeda antar keadaan segmen adalah **tingkat isian**, bukan rona border: penuh, berisi 25%, dan kosong. Dua border dengan rona berbeda tidak bisa dibuat lewat 3:1 satu sama lain di tema terang tanpa membuat salah satunya hampir hitam, dan tingkat isian adalah pembedaan yang lebih kuat sekaligus tidak bergantung pada persepsi warna.

Tangga juga punya dua token sendiri, `--ladder-fill` dan `--ladder-idle`, bukan memakai `--line` yang dipakai seluruh situs. Alasannya diukur: `--line` di tema terang hanya mencapai 1.2:1 terhadap latar, dan menaikkannya demi tangga akan membuat seluruh tema terang penuh garis.

Tidak ada teks di atas gradien, jadi tidak ada kasus "putih di atas gradien yang terang di sebagian area".

### 2.3 Dosis efek

| Efek | Batas | Di mana | Alasan |
|---|---|---|---|
| **Glow** | **1 elemen** | Ring tipis `--kaset-500` di sekeliling tombol Putar, **hanya selama audio benar-benar berbunyi**. Hilang saat klip berhenti. | Glow adalah penguat perhatian. Di game ini ada satu momen yang pantas diperkuat: saat suara sedang keluar, karena itu detik yang pemain harus dengarkan. Glow yang menandai keadaan nyata adalah sinyal; glow permanen adalah slop (R-13). |
| **Glassmorphism** | **1 elemen** | Backdrop blur hanya pada *overlay* di belakang drawer menu saat terbuka, untuk memisahkan panel dari game di belakangnya. | Blur dipakai sekali untuk memundurkan lapisan, bukan sebagai karakter semua permukaan (R-10). Navbar, kartu, dan baris riwayat tetap solid. |
| **Shadow** | **2 elemen** | Drawer menu dan dialog reveal. Keduanya benar-benar melayang di atas halaman. | Shadow adalah penanda elevasi. Elemen yang duduk di bidang halaman tidak diberi shadow, supaya elevasi masih berarti sesuatu (R-12). |
| **Gradien** | **1 tempat** | Satu gradien linear `--kaset-700` ke `--kaset-500`, horizontal, **hanya pada bilah progres playhead** di dalam tangga petunjuk. | Gradien di sini memetakan waktu: kiri adalah awal klip, kanan adalah ujung durasi yang terbuka. Gradien yang memetakan besaran adalah kerajinan; gradien yang menutupi halaman adalah default (R-01). Bukan gradien dua-hue. |

### 2.4 Tema terang

Dark adalah default dengan alasan yang ditulis di Bagian 1. Tapi produk ini juga dipakai siang di layar HP terang, jadi toggle terang wajib dibangun dan wajib berfungsi penuh (R-21, R-34).

Tema terang bukan hasil inversi otomatis. Aturannya:

- Latar `--paper-50` `#F7F3EC` (kertas hangat, sepadan dengan gading di tema gelap), surface `#FFFFFF`, border `#D9D1C6`.
- `--kaset-500` tetap sama untuk isian tombol Putar, tapi teks dan ikon bermerek turun ke `--kaset-700` supaya lewat 4.5:1 di atas latar terang, dan isian tangga juga turun ke `--kaset-700` karena amber terang hanya mencapai 1.5:1 di atas kertas.
- `--pandan-400` turun ke `#084A30`, `--bata-400` turun ke `#B33A28`, teks sekunder turun ke `#3A342D`, dengan alasan yang sama. Ketiganya adalah nilai yang lewat ambang, bukan nilai yang kelihatan cukup.
- Glow pada tombol Putar **dihapus** di tema terang dan diganti ring solid `--kaset-700` 2px. Glow tidak terbaca di atas kertas.
- Kedua tema diuji terpisah, komponen per komponen, dan `scripts/check-contrast.mjs` memeriksa keduanya dalam satu jalan. Tema terang yang merusak layout atau kontras adalah cacat, bukan "versi kedua" (R-34).

Preferensi tema disimpan di `localStorage` bersama bahasa (PRD R-14), dengan default mengikuti `prefers-color-scheme` dan jatuh ke gelap bila tidak ada sinyal.

---

## 3. Motif Identitas: Tangga Petunjuk

Satu pola, spesifik, diulang, dan selalu membawa informasi.

**Bentuknya:** lima segmen persegi panjang bersambung dalam satu bilah horizontal, mewakili tahap durasi `0.1s / 0.5s / 2s / 8s / 15s` (PRD R-01). Lebar segmen **tidak sama**: lebarnya proporsional terhadap akar durasi, jadi segmen 15s terlihat jelas lebih lebar dari segmen 0.1s. Ketidaksamaan itu adalah isi informasinya, bukan variasi gaya.

**Keadaan tiap segmen:**

| Keadaan | Visual | Arti |
|---|---|---|
| Terbuka dan terlewati | Isian penuh `--ladder-fill` | Durasi ini sudah pernah didengar. |
| Sedang aktif | Border `--ladder-fill`, isi gradien playhead yang bergerak kiri ke kanan hanya saat audio berbunyi | Inilah durasi yang berlaku sekarang. |
| Tersedia berikutnya | Border `--ladder-fill`, isian 25% | Akan terbuka kalau pemain salah atau melewati. |
| Belum terjangkau | Border `--ladder-idle`, isi kosong | Belum relevan. |

Pembedanya tingkat isian, bukan rona border. Alasan pengukurannya ada di Bagian 2.2.

**Di mana motif ini muncul kembali:**

1. Di bawah tombol Putar, sebagai indikator utama progres babak.
2. Sebagai **tanda merek**: tangga yang sama dipotong jadi tiga segmen, dipakai sebagai favicon dan ikon aplikasi.
3. Di setiap baris riwayat tebakan, sebagai penanda mini pada durasi berapa tebakan itu dibuat.
4. Di kartu hasil akhir dan di teks share (PRD R-12), diterjemahkan jadi pola karakter kotak.
5. Sebagai pembatas antar bagian di halaman Cara Main dan FAQ, menggantikan garis horizontal biasa. Di sana ia dekoratif, jadi dipakai **sekali per halaman** saja dan diberi `aria-hidden`.

**Kenapa motif ini dan bukan yang lain:** mekanik inti produk adalah durasi yang bertambah. Tangga petunjuk adalah mekanik itu dalam bentuk gambar, jadi motifnya tidak bisa dipindah ke produk lain tanpa kehilangan makna. Itu yang membuatnya identitas, bukan hiasan.

---

## 4. Tipografi

### 4.1 Pilihan huruf

| Peran | Huruf | Alasan |
|---|---|---|
| **Antarmuka dan judul** | **Plus Jakarta Sans** (Tokotype), weight 400 / 600 / 800 | Dipilih karena asal dan bentuknya, bukan karena default. Huruf ini dibuat oleh studio tipe Indonesia untuk identitas kota Jakarta, dan produk ini memang berpihak ke pasar Indonesia (PRD 1). Secara teknis: x-height relatif tinggi dan terminal yang dipotong rata membuatnya tetap jernih pada 14px di HP, ukuran yang banyak dipakai di layar ini. Bukan Inter, Geist, atau Space Grotesk. |
| **Angka, timecode, dan hasil share** | **IBM Plex Mono**, weight 400 / 600, **hanya `font-variant-numeric: tabular-nums`** | Dipakai karena fungsi, bukan estetika terminal. Durasi klip dan riwayat tebakan tersusun sebagai kolom angka yang harus rata satu di atas yang lain; huruf proporsional membuat `0.1s` dan `15s` bergeser dan kolomnya goyah. Teks share juga harus rapi saat ditempel ke WhatsApp atau X, yang merender dengan lebar karakter tetap. |

**Batas pemakaian monospace (R-06):** IBM Plex Mono **tidak boleh** dipakai untuk judul, paragraf, label tombol, atau nav. Hanya angka, satuan durasi, dan blok teks share. Tidak ada judul monospace besar dan tidak ada jendela terminal palsu.

**Label huruf besar:** diizinkan hanya untuk label kategori di dalam drawer menu, pada 11px / weight 600 / `letter-spacing: 0.04em`. Tracking lebar ekstrem (`HOW IT WORKS` bergaya) tidak dipakai (R-06).

### 4.2 Skala tipe

Fluid dengan `clamp()` supaya tidak ada ukuran px beku yang kebesaran di HP (lihat Bagian 7).

| Token | Ukuran | Line height | Pemakaian |
|---|---|---|---|
| `--text-clip` | `clamp(2.75rem, 12vw, 4.5rem)` | 1 | Angka durasi aktif di layar game. Satu-satunya tipe sebesar ini, karena ia titik fokus layar. |
| `--text-h1` | `clamp(1.75rem, 4.5vw, 2.5rem)` | 1.15 | Judul halaman konten. |
| `--text-h2` | `clamp(1.25rem, 3vw, 1.5rem)` | 1.25 | Judul bagian. |
| `--text-body` | `clamp(0.9375rem, 1.6vw, 1rem)` | 1.6 | Paragraf, item FAQ. |
| `--text-ui` | `0.875rem` | 1.4 | Label tombol, item menu, input. Tetap 14px di semua lebar karena ini ukuran kontrol, bukan bacaan. |
| `--text-meta` | `0.75rem` | 1.4 | Nama artis di reveal, keterangan kecil, atribusi API. |

Panjang baris paragraf dibatasi `max-width: 62ch` di halaman konten. Di layar game tidak ada paragraf panjang.

---

## 5. Sistem Bentuk dan Ruang

### 5.1 Radius (R-11)

Empat nilai, masing-masing punya tugas. Tidak ada elemen berbentuk pil.

| Token | Nilai | Dipakai untuk | Alasan |
|---|---|---|---|
| `--r-sharp` | `2px` | Segmen tangga petunjuk, chip filter aktif. | Hampir tegas, supaya segmen terbaca sebagai pembacaan alat ukur, bukan sebagai tombol. |
| `--r-control` | `6px` | Tombol, input, item menu. | Radius kontrol. Satu nilai untuk semua hal yang bisa diklik, supaya "bisa diklik" punya bentuk yang bisa dipelajari. |
| `--r-panel` | `12px` | Panel player, baris riwayat, kartu di halaman konten. | Radius permukaan. Lebih besar dari kontrol supaya kontrol di dalamnya terlihat bersarang, bukan sejajar. |
| `--r-round` | `50%` | **Hanya** tombol Putar. | Satu-satunya elemen bulat di seluruh produk. Bentuknya sendiri yang menjadikannya titik fokus, tanpa butuh warna atau ukuran tambahan. |

### 5.2 Skala ruang

Basis 4px: `4, 8, 12, 16, 24, 32, 48, 64, 96`.

Ruang dipakai sebagai struktur, bukan sisa (R-05). Tiga register berbeda, dan perbedaannya disengaja:

- **Di dalam panel player:** rapat dan terukur (`8` sampai `16`). Semua kontrol harus terjangkau tanpa menggeser mata jauh, karena pemain memakainya berulang-ulang dalam satu babak.
- **Antar blok di layar game:** `24` sampai `32`. Cukup untuk memisahkan player, input, dan riwayat menjadi tiga zona yang jelas.
- **Antar bagian di halaman konten:** `48` sampai `96` di desktop, turun ke `32` sampai `48` di HP (lihat Bagian 7). Di sinilah ritme halaman dipatahkan supaya pembaca tahu satu topik sudah selesai.

Padding bagian **tidak** seragam di semua bagian. Bagian "Cara Main" diberi ruang atas lebih besar dari bagian lain karena ia bagian pertama setelah game, dan jedanya menandai peralihan dari "main" ke "baca".


---

## 6. Struktur Halaman

### 6.1 Prinsip: game adalah halamannya

Referensi layout yang diminta adalah songspot.net, dan satu hal yang diambil dari sana adalah keputusan strukturalnya: **yang pertama terlihat saat halaman dibuka adalah game yang sudah siap dimainkan**, bukan hero marketing dengan dua tombol CTA dan tangkapan layar produk. Konten penjelasan ada di bawah game dan di rute terpisah, untuk orang yang mencarinya.

Yang **tidak** diambil dari referensi: tata letaknya tidak disalin per komponen, dan produk ini tidak meniru identitas visualnya (R-30). Referensi dipakai untuk keputusan "game dulu, penjelasan belakangan", bukan sebagai template.

Konsekuensinya untuk setiap layar: **satu titik fokus**. Di layar game, titik fokusnya adalah tombol Putar bersama angka durasi aktif di atasnya. Semua elemen lain, termasuk input tebakan, secara visual mengalah ke sana sampai klip sudah diputar sekali.

### 6.2 Rute yang benar-benar ada (R-24)

Navigasi hanya boleh berisi tujuan dari daftar ini. Tidak ada About, Blog, Careers, Press, atau Pricing karena produk ini gratis tanpa akun (PRD 1).

| Rute | Isi | Status v1 |
|---|---|---|
| `/` | Layar game. Mode bebas secara default. | Fase 1 |
| `/#cara-main` | Bagian Cara Main di halaman yang sama, dijangkau dengan anchor nyata. | Fase 1 |
| `/#tanya` | Bagian pertanyaan singkat di halaman yang sama. | Fase 1 |
| `/faq` | FAQ lengkap. | Fase 1 |
| `/genre` | Daftar genre, tiap genre memuat game dengan filter terpasang. | Fase 2 |
| `/genre/[slug]` | Game dengan satu genre terpilih. | Fase 2 |
| `/harian` | Mode "Lagu Hari Ini". | Fase 2 |
| `/privasi` | Kebijakan Privasi. | **Fase 1, wajib** |
| `/ketentuan` | Syarat & Ketentuan. | **Fase 1, wajib** |

Rute Fase 2 **tidak boleh** muncul di menu sebelum dibangun. Kalau ingin ditampilkan lebih awal, item menu diberi label terlihat "Segera" dan tidak bisa ditekan, bukan tautan mati (R-24, R-26).

Dua halaman legal ditandai wajib di Fase 1 karena produk memutar audio dari API pihak ketiga dan menyimpan data di `localStorage` (PRD 8). Mengirim produk tanpa keduanya adalah pola "demo tanpa produk".

### 6.3 Urutan dan isi `/`

Urutan ini mengikuti kebutuhan isi, bukan urutan template. Tidak ada bagian testimoni, tidak ada bilah logo "dipercaya oleh", tidak ada angka statistik publik, karena produk ini belum punya data nyata untuk ketiganya (R-17, R-18, R-36).

1. **Bilah atas**, tinggi 56px, sticky, solid `--ink-800` dengan border bawah 1px. Isinya: wordmark di kiri, toggle bahasa `ID / EN` dan tombol Menu di kanan. Tombol Menu hanya ada di bawah 1280px, karena di atas itu pengaturan punya kolomnya sendiri (Bagian 6.6). Isinya sengaja sedikit, karena setiap piksel tinggi bilah ini adalah piksel yang hilang dari game.
2. **Panel game.** Zona tunggal yang memuat angka durasi, tombol Putar, tangga petunjuk, kontrol Lewatin dan Nyerah, input tebakan, dan riwayat tebakan. Rinciannya di Bagian 6.4. Di XXL ia menjadi kolom tengah dari tiga kolom; di bawah itu ia satu-satunya kolom.
3. **Bagian Cara Main.** Alur nyata, bukan tiga langkah bulat bernomor. Lihat Bagian 6.5.
4. **Bagian Genre.** Daftar genre sebagai tautan, hanya setelah rute genre ada. Sebelum itu bagian ini tidak dirender sama sekali, bukan dirender dengan tautan mati.
5. **Bagian pertanyaan singkat.** Tiga sampai empat pertanyaan yang benar-benar spesifik ke produk ini, dengan tautan ke `/faq`. Isi pertanyaannya ditentukan di Bagian 9.4 (R-28).
6. **Footer.** Satu kolom, bukan empat (R-05). Isinya: tautan Privasi, Ketentuan, FAQ, lalu satu baris atribusi sumber audio yang diwajibkan API (PRD 8). Produk ini hanya punya satu kelompok tautan, jadi footernya satu kolom.

Bagian 3, 4, dan 5 **tidak** memakai komposisi yang sama satu dengan lainnya, sesuai dial RHYTHM 2: Cara Main adalah daftar beralur dengan percabangan, Genre adalah grid tautan padat, pertanyaan singkat adalah daftar accordion rata kiri tanpa kartu.

### 6.4 Anatomi panel game

Susunan vertikal dari atas ke bawah, karena mata pemain bergerak sekali ke bawah per siklus tebakan dan tidak perlu melompat:

```
  [ angka durasi aktif ]          text-clip, IBM Plex Mono, --kaset-500
  [ tombol Putar       ]          r-round, 88px, satu-satunya elemen bulat
  [ tangga petunjuk    ]          5 segmen, lebar tidak sama
  [ Lewatin  |  Nyerah ]          dua tombol sekunder, border saja
  ~~~~~~~ pemisah 24px ~~~~~~~
  [ input tebakan + autocomplete ]
  [ tombol Tebak                 ]
  ~~~~~~~ pemisah 24px ~~~~~~~
  [ riwayat tebakan: n baris     ]  hanya dirender bila n > 0
```

Keputusan yang perlu alasannya ditulis:

- **Angka durasi di atas tombol, bukan di dalamnya.** Angka itu berubah setiap babak dan harus bisa dibaca sekilas; menaruhnya di dalam tombol bulat membatasi ukurannya dan membuat label tombol bersaing dengan angka.
- **Tombol Putar 88px.** Jauh di atas minimum sentuh 44px, karena ini kontrol yang ditekan paling sering dalam satu babak dan sering ditekan tanpa melihat.
- **Lewatin dan Nyerah hanya berbingkai, tanpa isian warna.** Keduanya tindakan yang mengurangi peluang pemain, jadi tidak boleh terlihat semenarik Putar. Nyerah diberi teks `--ink-200`, satu tingkat lebih redup dari Lewatin, karena lebih final.
- **Riwayat tidak dirender saat kosong.** Wadah kosong dengan judul "Riwayat" hanya menambah tinggi halaman di babak pertama, saat layar justru paling butuh ringkas.
- **Setelah ronde selesai, pasangan tombol itu berganti**, bukan dinonaktifkan: menjadi `Putar lagi` (primer) dan `Lihat jawabannya` (sekunder). Ini ditemukan saat klik-through: panel reveal bisa ditutup dengan Escape, dan tanpa penggantian ini layar menyisakan semua kontrol mati tanpa jalan ke ronde berikutnya yang terlihat. Menu memang punya "Acak ulang", tapi jalan keluar tidak boleh tersembunyi.

### 6.5 Bagian Cara Main: alur nyata, bukan tiga langkah

Alur sebenarnya dari PRD 5 punya percabangan dan perulangan, jadi itu yang digambarkan. Tidak ada ikon bulat bernomor 1, 2, 3 (R-05).

Bentuknya: daftar bernomor rata kiri dengan satu percabangan bersarang yang ditandai pergeseran indentasi dan garis vertikal `--ink-600` 1px, bukan stripe berwarna.

```
1. Tekan Putar. Kamu dapat 0,1 detik, dan boleh ulang sesukamu.
2. Ketik judulnya, pilih dari daftar yang muncul, lalu tekan Tebak.
   ├─ Bener  : lagunya langsung kebuka, lengkap sama artis dan covernya.
   └─ Salah atau dilewatin : klipnya nambah jadi 0,5s, terus 2s, 8s, 15s.
      Ulang dari langkah 1.
3. Habis 6 kali, jawabannya dibuka. Bisa main lagi atau bagiin hasilnya.
```

Jumlah langkahnya tiga karena alurnya memang tiga, bukan karena tiga adalah angka yang biasa dipakai. Kalau alur berubah di Fase 2, jumlahnya ikut berubah.

### 6.6 Pengaturan: panel samping di desktop, sheet di layar sempit

Semua opsi hidup di satu tempat, tapi **tempatnya berbeda menurut ruang yang benar-benar ada**.

**Di desktop lebar (XXL, 1280px ke atas): tiga kolom, tanpa hamburger.**

```
  [ Pengaturan ]   [ panel game ]   [ Statistik ]
      300px            520px            300px
```

Alasannya satu dan bisa diuji: pengaturan di game ini **bukan** opsi yang disetel sekali lalu ditinggalkan. Genre, era, tingkat kesulitan, dan volume adalah hal yang pemain ubah di tengah bermain, dan menyembunyikannya di balik drawer menambah dua ketukan (buka, tutup) untuk setiap perubahan. Di layar selebar ini ruang itu memang ada dan sebelumnya kosong, jadi menyembunyikannya adalah pilihan yang merugikan tanpa menghemat apa pun.

Tombol hamburger **tidak dirender sama sekali** di lebar ini, bukan disembunyikan secara visual. Kontrol yang tidak bisa dipakai tidak boleh tetap bisa dijangkau Tab, dan dua jalan ke pengaturan yang sama hanya membuat pemain menebak mana yang benar.

Statistik duduk di kanan karena ia **data yang dibaca, bukan kontrol yang ditekan**. Memisahkan "yang kamu ubah" di kiri dari "yang kamu lihat" di kanan membuat kolom tengah tetap satu-satunya tempat tindakan.

**Satu titik fokus tetap dijaga.** Panel samping sengaja dibuat lebih tenang: tidak ada tombol berisian penuh, labelnya `--text-meta` berwarna `--muted`, dan tidak ada radius bulat maupun glow. Tombol Putar di tengah tetap satu-satunya elemen bulat dan satu-satunya yang punya glow di seluruh layar.

**Scrollbar panel kiri ada di tepi kiri, bukan kanan.** Panel pengaturan lebih tinggi dari layar dan menggulir di dalam dirinya sendiri (Bagian 7.1), dan di tepi kanan scrollbar-nya berdiri tepat di celah antara kolom pengaturan dan kolom game. Celah itu tugasnya memisahkan dua kolom, jadi menambahkan garis vertikal di sana justru mengaburkan pemisahan yang sedang dikerjakannya. Dipindah ke kiri, ia menempel ke tepi luar halaman, tempat scrollbar memang biasa berada. Teknisnya: `dir="rtl"` pada wadah yang menggulir, dan `dir="ltr"` pada pembungkus isinya supaya arah teks dan tata letak tidak ikut terbalik. Panel statistik di kanan tidak diubah, karena scrollbar-nya sudah berada di tepi luar halaman.

**Scrollbar dikustom, dan warnanya mengikuti aturan palet yang sama dengan elemen lain.**

| Hal | Nilai | Alasan |
|---|---|---|
| Lebar di panel samping | 6px | Cukup untuk digenggam kursor, cukup tipis untuk tidak menabrak teks di kolom selebar 300px. |
| Lebar scrollbar halaman | 10px dengan border transparan 2px | Ia menggulir seluruh halaman, bukan satu kolom, jadi target genggamnya lebih besar. Border transparan membuat batangnya terlihat lebih ringan tanpa jadi lebih sulit digenggam. |
| Warna saat diam | `--kaset-700` | Warna merek, tapi tingkat yang lebih gelap. `--kaset-500` dikunci sebagai penanda keadaan game (Bagian 2.1), dan scrollbar tidak menandai keadaan apa pun. |
| Warna saat hover | `--kaset-500` | Di sini ada interaksi nyata, dan itu momen yang pantas diperkuat. |
| Track | Transparan di panel, `--bg` di halaman | Track yang berwarna hanya menambah satu batang lagi ke layar. |
| Jarak teks ke scrollbar | padding 10px di sisi scrollbar | Browser yang memakai overlay scrollbar menggambarnya di atas isi tanpa menempati ruang, jadi tanpa padding ini teks akan berada di bawahnya. |

Dua jalur CSS dipakai dan dipisah dengan `@supports selector(::-webkit-scrollbar)`, bukan ditulis bertumpuk: Chromium mengabaikan pseudo-element itu begitu `scrollbar-width` disetel, jadi menulis keduanya sekaligus membuat lebar 6px tidak pernah berlaku. Mesin tanpa pseudo-element itu memakai `scrollbar-width` dan `scrollbar-color` standar.

**Di bawah 1280px: sheet dan drawer seperti sebelumnya.** Lebar kolom di tabel atas bukan angka yang dipilih lalu dipaksa muat: pada 264px, label genre seperti "Rock dan indie Indonesia" memecah chip jadi baris-baris ragged dan panelnya tumbuh jauh lebih tinggi dari panel game. Diukur ulang, kolomnya butuh 300px, dan 300 + 520 + 300 + dua jarak 24px = 1168px. Itu yang memindahkan ambangnya dari 1152 ke 1280, bukan sebaliknya. Dibuka dari tombol **berlabel "Menu"**, bukan ikon hamburger tanpa teks.

**Isi tiap varian berbeda, dan perbedaannya punya alasan:**

| Kelompok | Panel samping (desktop) | Drawer (layar sempit) | Alasan |
|---|---|---|---|
| Bahasa | tidak | ya | Toggle `ID / EN` sudah ada di bilah atas, dan di desktop bilah itu persis di atas panel kiri. Di layout Rapat bilah atas disembunyikan, jadi drawer adalah satu-satunya jalan ke sana. |
| Tema | ya | ya | |
| Lagu (genre, era, kesulitan, acak ulang) | ya | ya | Ini yang paling sering diubah, dan justru ini alasan panel samping ada. |
| Audio (volume, mulai dari) | ya | ya | |
| Tampilan (layout) | ya | ya | |
| Statistik | tidak | ya | Di desktop ia punya kolomnya sendiri di kanan. Di layar sempit tidak ada kolom itu, jadi isinya kembali ke drawer. |
| Tautan lainnya | tidak | ya | Footer di desktop sudah memuat tautan yang sama beberapa layar di bawah. Di layout Rapat footer tidak dirender, jadi drawer memuatnya. |

**Perilaku drawer:** geser dari kanan di L, dari bawah di S dan M, ditutup dengan Escape, klik overlay, atau tombol tutup berlabel. Fokus dikurung di dalam drawer selama terbuka dan dikembalikan ke tombol Menu setelah ditutup (R-32).

---

## 7. Perilaku Responsif

Prinsipnya: **layout HP adalah layout yang berbeda, bukan layout desktop yang dikecilkan.**

### 7.1 Breakpoint

Ditempatkan di titik isi berhenti bekerja, bukan di lebar perangkat tertentu. Lima keadaan, supaya lebar tablet dan laptop kecil tidak mewarisi keadaan yang salah:

| Keadaan | Lebar | Yang berubah |
|---|---|---|
| **S** | sampai 479px | Panel game satu kolom penuh lebar, padding tepi 16px. Kontrol Lewatin dan Nyerah berbagi satu baris 50/50. Riwayat tebakan menumpuk sebagai baris penuh lebar. Menu jadi sheet dari bawah. |
| **M** | 480px sampai 767px | Padding tepi naik ke 24px, panel game mendapat `max-width: 420px` dan dipusatkan, supaya tombol tidak melebar jadi batang panjang. Tangga petunjuk mulai menampilkan label durasi di bawah tiap segmen. |
| **L** | 768px sampai 1151px | Panel game `max-width: 520px` tetap dipusatkan. Halaman konten di bawahnya pindah ke dua kolom untuk daftar genre dan FAQ. Menu jadi drawer dari kanan. |
| **XL** | 1152px sampai 1279px | Panel game tetap 520px dan dipusatkan, masih satu kolom dengan tombol Menu. Halaman konten di bawahnya melebar: grid genre jadi tiga kolom. |
| **XXL** | 1280px ke atas | **Tiga kolom: Pengaturan 300px di kiri, panel game 520px di tengah, Statistik 300px di kanan**, dengan jarak 24px. Kedua panel samping sticky di bawah bilah atas, dan **punya `max-height` setinggi viewport dikurangi bilah atas plus menggulir di dalam dirinya sendiri**: panel pengaturan lebih tinggi dari layar, dan sticky tanpa batas tinggi membuat bagian bawahnya tidak bisa dijangkau sama sekali. Tombol Menu tidak dirender, dan drawer tidak dipakai (lihat Bagian 6.6). Panel game tetap 520px dan **tidak ikut melebar**, karena memperlebar panel hanya menjauhkan tombol dari mata tanpa menambah informasi. |

Lima keadaan, bukan empat, karena isinya memang butuh lima: tiga kolom baru muat pada 1280px (300 + 520 + 300 + dua jarak 24px = 1168px), sedangkan halaman konten sudah sanggup melebar sejak 1152px. Memaksa keduanya berbagi satu ambang akan mengorbankan salah satunya.

Verifikasi dilakukan dengan menggeser viewport melewati seluruh rentang, bukan dengan memeriksa empat lebar sampel (R-35).

### 7.2 Skala di layar kecil

- Semua ukuran tipe memakai `clamp()` (Bagian 4.2), jadi tidak ada px beku yang kebesaran di HP.
- Padding antar bagian halaman konten: `96px` di XL turun ke `32px` di S. Padding desktop yang dibawa utuh ke HP akan membuat halaman menggulir melewati ruang kosong.
- Tidak ada bagian ber-`height: 100vh`. Kalau sebuah bagian benar-benar perlu setinggi layar, satuannya `dvh`, bukan `vh`, supaya chrome browser HP tidak membuatnya meluber.
- Tombol Putar: 88px di M ke atas, **72px di S**. Tetap jauh di atas 44px, tapi tidak lagi mendominasi layar sempit.

### 7.3 Grid dan luapan

- Grid daftar genre memakai `repeat(auto-fit, minmax(160px, 1fr))`, jadi kolom menyusut dan membungkus sendiri tanpa breakpoint tambahan.
- Tabel distribusi tebakan di panel statistik **tidak** dipertahankan sebagai tabel di S. Ia direflow jadi daftar baris label-plus-bilah, karena tabel enam kolom di lebar 360px adalah sumber luapan horizontal yang paling umum.
- Judul lagu panjang di baris riwayat dan di autocomplete: `min-width: 0` pada anak flex, lalu `text-overflow: ellipsis` satu baris, dengan judul penuh tersedia sebagai `title` dan terbaca utuh di panel reveal. Memotong di daftar boleh karena teks penuhnya tersedia di tempat lain; memotong satu-satunya tempat sebuah informasi muncul tidak boleh.
- `overflow: hidden` hanya dipakai pada wadah cover art. Tidak dipakai pada wadah teks.
- Target: nol gulir horizontal pada 320px.

### 7.4 Navigasi di layar kecil

Tidak ada baris nav desktop yang dipaksa bertahan di HP. Bilah atas di S hanya memuat wordmark, toggle bahasa, dan tombol Menu, dan ketiganya sudah muat dalam satu baris 56px tanpa perlu dibungkus.

Menu di S terbuka sebagai **sheet dari bawah**, bukan drawer samping, karena ibu jari berada di bawah layar. Sheet memakai `max-height: 85dvh` dengan isi yang bisa digulir, dan menghormati `env(safe-area-inset-bottom)`.

Tidak ada bottom nav tetap di produk ini, jadi tidak ada bilah bawah yang menutupi isi. Kalau nanti ditambahkan, tingginya wajib direservasi lewat `scroll-padding-bottom` pada halaman.

### 7.5 Layout "Rapat" untuk video vertikal

Mode ini dari PRD R-19 dan punya kebutuhan berbeda dari sekadar "HP": pembuat konten merekam layar dengan wajahnya di sepertiga atas frame, jadi game harus padat dan berada di tengah ke bawah.

Perbedaan dari layout Lebar:
- Bilah atas disembunyikan, menyisakan tombol Menu mengapung di sudut.
- **Kedua panel samping tidak dirender**, meski lebarnya cukup. Rapat dipakai untuk merekam video vertikal, dan panel samping akan terpotong frame.
- Bagian Cara Main, Genre, pertanyaan, dan footer tidak dirender. Hanya panel game.
- Jarak vertikal antar zona turun satu tingkat skala (`24px` jadi `16px`).
- Riwayat tebakan dibatasi tiga baris terakhir dengan hitungan sisanya, supaya panel tidak tumbuh keluar frame.

Pilihan layout disimpan di `localStorage` dan **tidak** otomatis aktif berdasarkan lebar layar, karena ini keputusan pembuat konten, bukan konsekuensi ukuran perangkat.

### 7.6 Target sentuh

- Minimum 44 x 44px untuk semua kontrol, termasuk toggle bahasa dan tombol tutup drawer.
- Jarak antar kontrol bersebelahan minimal 8px. Lewatin dan Nyerah yang berdampingan diberi jarak 12px karena keduanya punya konsekuensi berbeda dan salah tekan merugikan.
- Chip filter genre di drawer: tinggi visual boleh 32px, tapi area sentuhnya dinaikkan ke 44px lewat padding transparan.
- Segmen tangga petunjuk **tidak** interaktif, jadi tidak terkena aturan ini. Ia murni indikator.
- Tidak ada interaksi yang hanya ada di hover. Autocomplete, accordion FAQ, dan tooltip atribusi semuanya punya padanan ketuk, dan semua kontrol punya umpan balik `:active` yang terlihat.


---

## 8. Komponen

Variasi antar komponen mengikuti hierarki isi, bukan dibuat seragam supaya rapi (R-14).

### 8.1 Tombol

| Varian | Visual | Dipakai untuk | Alasan |
|---|---|---|---|
| **Putar** | Bulat 88px, isi `--kaset-500`, teks dan ikon `--ink-900`, ring glow saat berbunyi | Hanya tombol Putar | Satu-satunya elemen bulat dan satu-satunya yang punya glow. Bentuk dan efeknya menjadikannya fokus tanpa perlu diperbesar lagi. |
| **Primer** | `--r-control`, isi `--kaset-500`, teks `--ink-900` | Tebak, Main lagi | Tindakan utama di zonanya masing-masing. Isian penuh dipakai maksimal satu per zona. |
| **Sekunder** | `--r-control`, transparan, border 1px `--ink-500`, teks `--ink-50` | Lewatin, Bagiin hasil, Acak ulang | Tindakan nyata tapi bukan jalur utama. |
| **Tenang** | `--r-control`, tanpa border, teks `--ink-200` | Nyerah, Tutup | Tindakan yang tidak ingin didorong. |
| **Chip** | `--r-sharp`, border 1px, aktif berisi `--kaset-700` dengan teks `--ink-50` | Filter genre, era, difficulty | Bentuk tegas memisahkannya dari tombol tindakan: chip mengubah keadaan, tombol menjalankan tindakan. |

Tidak ada tanda panah `→` pada tombol mana pun. Tidak ada satu pun tombol di produk ini yang memindahkan pemain ke tempat lain secara harfiah, jadi petunjuk arah tidak membawa informasi (R-08).

Label tombol diambil dari file terjemahan dan spesifik ke tindakannya: `Putar`, `Tebak`, `Lewatin`, `Nyerah`, `Main lagi`, `Bagiin hasil`. Tidak ada `Mulai`, `Pelajari lebih lanjut`, atau `Coba sekarang` (R-15).

### 8.2 Input tebakan dan autocomplete

- Field: tinggi 48px, `--r-control`, isi `--ink-700`, border 1px `--ink-600`, border `--kaset-500` saat fokus ditambah focus ring 2px offset 2px.
- Placeholder jujur menyatakan isinya: `Ketik judul lagunya di sini...`. Tidak memakai judul lagu contoh sebagai placeholder, karena placeholder yang berisi judul asli terbaca seperti petunjuk.
- Daftar saran: maksimal 6 hasil, muncul di bawah field sebagai panel solid `--ink-800` dengan border, **tanpa blur**. Tiap baris: judul (`--text-ui`, `--ink-50`) di atas nama artis (`--text-meta`, `--ink-200`).
- **Pencarian mencakup judul dan nama artis.** Mengetik nama artis mengembalikan lagu-lagu artis itu, karena pemain sering ingat siapa yang menyanyi sebelum ingat judulnya. Peringkatnya: judul yang diawali teks yang diketik, lalu judul yang memuatnya di tengah, lalu artis yang diawali, lalu artis yang memuatnya. Judul di atas artis karena yang diminta game ini adalah judul, jadi teks yang cocok sebagai judul hampir pasti memang judul yang dimaksud.
- **Yang ditebalkan adalah tempat kecocokannya.** Kalau yang cocok judulnya, judulnya yang ditebalkan; kalau yang cocok artisnya, nama artisnya. Tanpa aturan ini, pemain yang mengetik nama artis melihat enam baris tanpa petunjuk kenapa keenamnya muncul.
- **Tanda baca boleh dilewati pemain.** Pencocokan memakai dua bentuk: bentuk berspasi dan bentuk rapat tanpa tanda baca sama sekali. Ini perlu karena normalisasi mengubah tanda baca jadi spasi, sehingga `D'Masiv` tersimpan sebagai `d masiv` dan `The S.I.G.I.T.` sebagai `the s i g i t`, sedangkan pemain mengetik `dmasiv` dan `sigit`. Aturan yang sama berlaku saat menilai jawaban, jadi `gods plan` diterima untuk `God's Plan`.
- Nama artis **tidak** diterima sebagai jawaban benar. Yang ditanya game ini judul, dan artis hanya jalan untuk menemukannya.
- Bagian judul yang cocok dengan yang diketik ditebalkan ke weight 600, tidak diwarnai, supaya `--kaset-500` tetap hanya berarti "keadaan game", bukan "teks cocok".
- Keyboard: `ArrowDown` dan `ArrowUp` memindah sorotan, `Enter` memilih baris tersorot, `Escape` menutup daftar tanpa mengosongkan field. Pola ARIA combobox dengan `aria-activedescendant`.
- Tombol Tebak nonaktif sampai ada lagu yang benar-benar dipilih dari daftar, dan keadaan nonaktifnya dijelaskan teks pendek di bawah field, bukan hanya diredupkan.

### 8.3 Baris riwayat tebakan

Bukan kartu. Baris penuh lebar, tinggi 56px, `--r-panel`, isi `--ink-800`, dipisah jarak 8px.

Isi tiap baris, dari kiri: penanda tangga mini (menunjukkan di durasi berapa tebakan dibuat), judul yang ditebak, lalu status di kanan.

| Status | Visual | Keterangan |
|---|---|---|
| Salah | Teks judul `--ink-200`, ikon dan label `--bata-400` | Satu baris per tebakan salah. |
| Dilewatin | Slot judul dibiarkan kosong, label `Dilewatin` berwarna `--muted`, tanpa ikon | Tidak ada judul karena tidak ada tebakan, dan skip bukan tebakan salah: `--bata-400` dikunci ke state salah dan error, jadi tidak dipakai di sini. Menuliskan "Dilewatin" di slot judul sekaligus di label hanya mengulang satu fakta dua kali. |
| Benar | Border 1px `--pandan-400`, label `--pandan-400`, isi tetap `--ink-800` | Hanya satu baris seperti ini bisa ada per babak. Warnanya di border dan label, tidak membanjiri isi baris, supaya judulnya tetap yang terbaca pertama. |

Tidak ada stripe vertikal berwarna di tepi kiri baris (R-01). Penanda statusnya adalah tangga mini di kiri, yang membawa informasi durasi.

### 8.4 Panel reveal

Muncul sebagai dialog setelah babak berakhir, menang maupun kalah. Keduanya memakai panel yang sama dengan isi berbeda, bukan dua komponen.

Isinya: cover art 96px (`--r-panel`, `overflow: hidden`), judul lagu (`--text-h2`), nama artis (`--text-meta`), tangga petunjuk dalam keadaan akhir, lalu statistik streak. Tombol: `Main lagi` (primer) dan `Bagiin hasil` (sekunder).

- Saat menang, angka streak diberi `--pandan-400` dan panelnya **tidak** diberi konfeti, kilau, atau animasi lompat (MOTION 1).
- Saat kalah, tidak ada warna semantik pada panel. Jawabannya ditampilkan netral, karena menyalahkan pemain dengan warna merah di seluruh panel tidak membantu.
- Atribusi sumber audio (iTunes atau Deezer) muncul di sini sebagai `--text-meta`, karena di sinilah metadata lagu ditampilkan dan di situlah atribusi relevan (PRD 8).
- Dialog ditutup dengan Escape, fokus dikurung, dan fokus pertama jatuh ke judul lagu, bukan ke tombol, supaya pembaca layar membacakan jawabannya lebih dulu.

### 8.5 Hasil share

Teks polos untuk clipboard, dirender dengan IBM Plex Mono di pratinjau. Bentuknya menerjemahkan tangga petunjuk, jadi motifnya ikut sampai ke luar situs.

**Tidak memakai emoji** (keputusan pemilik, Bagian 14.1). Polanya memakai tiga karakter blok geometris Unicode, bukan emoji kotak berwarna:

| Karakter | Kode | Arti |
|---|---|---|
| `░` | U+2591 | Segmen belum terpakai. |
| `▓` | U+2593 | Segmen terpakai, tebakan salah atau dilewatin. |
| `█` | U+2588 | Segmen tempat pemain berhasil. |

```
TebakLagu 05/10
▓▓█░░  benar di 2s
tebaklagu.example
```

Pola `▓▓▓▓▓` tanpa `█` berarti pemain tidak berhasil. Lima karakter selalu, jadi lebar polanya tetap.

Tiga alasan karakter ini dipilih, bukan emoji kotak: lebarnya tetap di font monospace sehingga pola tetap rata saat ditempel ke WhatsApp atau X; artinya dibawa oleh kepadatan karakter, bukan oleh warna, jadi tetap terbaca untuk pemain dengan buta warna; dan emoji tidak dipakai di mana pun di produk ini.

Posisi karakter adalah data, bukan hiasan: ia menyatakan di durasi berapa pemain berhasil. Judul lagu tidak pernah ikut di teks share.

### 8.6 Ikon

Bukan dari satu pustaka ikon tipis-membulat yang seragam, karena tampilan pustaka default itu sendiri adalah penandanya (R-04). Produk ini hanya butuh **tujuh** ikon, dan semuanya digambar sebagai SVG stroke 1.75px dengan ujung dipotong rata, menyamakan karakternya dengan terminal huruf Plus Jakarta Sans.

| Ikon | Bentuk | Relevansi |
|---|---|---|
| Putar | Triangle solid | Kontrol pemutaran standar. |
| Lewatin | Triangle dengan garis vertikal di kanan | Konvensi "lompat ke berikutnya" pada pemutar audio. |
| Volume | Kerucut speaker dengan satu busur | Kontrol volume. |
| Menu | Tiga garis horizontal, **selalu dengan teks "Menu"** | Dipakai berlabel, bukan sebagai hamburger telanjang. |
| Tutup | Dua garis menyilang | Tutup dialog dan drawer. |
| Benar | Centang | Status tebakan benar. |
| Salah | Dua garis menyilang, tebal berbeda dari ikon Tutup | Status tebakan salah. |

Tidak ada sparkle, kilat, kristal, kubus, robot, atau orb. Tidak ada ikon di samping judul bagian: label bagiannya sudah mengerjakan tugas itu.

---

## 9. Keadaan UI

Keadaan bukan bonus. Setiap keadaan di bawah ini punya desain sendiri, dan tiap pesan menyebut **penyebab** dan **tindakan berikutnya**, bukan "Tidak ada data" (R-27).

### 9.1 Keadaan layar game

| Keadaan | Yang terlihat | Pesan |
|---|---|---|
| **Kunjungan pertama** | Panel game lengkap, riwayat tidak dirender, angka durasi menunjukkan `0.1s`, tombol Putar berdenyut **sekali** saat halaman siap lalu diam | Satu baris di bawah tombol: `Pakai headphone kalau bisa, klipnya cuma 0,1 detik.` Ini satu-satunya onboarding, dan ia memberi tindakan nyata. |
| **Memuat audio** | Tombol Putar dinonaktifkan dengan indikator lingkaran tipis di ring-nya, bukan spinner melayang | `Nyiapin klipnya...` Menyebut apa yang dimuat, bukan hanya berputar. |
| **Berbunyi** | Playhead bergerak di segmen aktif, glow ring aktif | Tidak ada teks. Pemain sedang mendengar. |
| **Menunggu tebakan** | Field input mendapat fokus otomatis di desktop, **tidak** di HP (supaya keyboard virtual tidak menutup tombol Putar) | `Sisa {count} tebakan` |
| **Tebakan salah** | Baris riwayat baru muncul, tangga maju satu segmen, angka durasi berubah | `Belum pas. Sekarang kamu dapat {duration}.` Menyebut konsekuensi, bukan hanya "salah". |
| **Benar** | Panel reveal terbuka | Lihat Bagian 8.4 |
| **Tebakan habis** | Panel reveal terbuka tanpa warna semantik | `Udah 6 kali. Ini lagunya:` |

### 9.2 Keadaan kosong

| Kasus | Pesan dan tindakan |
|---|---|
| Kombinasi filter tidak menghasilkan lagu | `Belum ada lagu yang cocok sama filter ini.` plus tombol `Longgarin filter` yang benar-benar mengatur ulang filter paling sempit, bukan sekadar menutup pesan. |
| Autocomplete tanpa hasil | `Nggak ketemu judul itu di katalog kami.` plus baris kedua `Coba potongan judulnya aja.` Tidak memakai ilustrasi. |
| Statistik masih kosong | `Belum ada riwayat. Selesaiin satu lagu dulu, nanti statistiknya muncul di sini.` Tidak menampilkan angka `0` berderet yang terlihat seperti data. |

Tidak ada ilustrasi Undraw, Storyset, atau karakter 3D di keadaan kosong mana pun (R-22). Yang ditampilkan adalah teks plus satu tindakan.

### 9.3 Keadaan error

Dipisah per penyebab, karena solusinya berbeda:

| Penyebab | Pesan | Tindakan |
|---|---|---|
| Gagal ambil preview dari API | `Gagal ngambil klip lagunya.` | Tombol `Coba lagi`, dan setelah dua kegagalan berurutan, tombol `Ganti lagu lain`. |
| Audio diblokir CORS | `Klip ini nggak bisa diputar dari sumbernya.` | Otomatis mengganti lagu sekali dan memberi tahu pemain bahwa lagunya diganti. Tidak membiarkan pemain menebak lagu yang bisu. |
| `AudioContext` belum di-resume | `Ketuk sekali dulu buat ngaktifin suara.` | Keadaan ini wajar di HP (PRD 7.2), jadi pesannya bukan error merah, melainkan instruksi netral pada tombol Putar. |
| Offline | `Kamu lagi offline. Game butuh koneksi buat ngambil klipnya.` | Statistik lokal tetap bisa dibuka, dan itu disebutkan. |
| Batas kirim feedback | `Udah kirim hari ini. Coba lagi besok.` | Menyebut kapan bisa lagi, bukan hanya menolak. |

Pesan error memakai `--bata-400` **hanya pada teks dan ikonnya**, bukan sebagai latar penuh panel.

### 9.4 FAQ

Pertanyaan hanya yang spesifik ke produk ini (R-28). Daftar awal, semuanya menjawab kekhawatiran nyata dari mekanik dan batasan produk:

1. Kenapa klipnya cuma 0,1 detik di awal?
2. Kenapa ada lagu yang nggak ada di katalog?
3. Kok tebakan gue ditulis bener tapi dianggap salah? (menjelaskan pencocokan fuzzy dan judul alternatif, PRD R-05)
4. Streak gue ilang pas ganti HP, kenapa? (menjelaskan `localStorage`, PRD R-11)
5. Lagunya diputar penuh nggak? (menjelaskan preview resmi dan batasan legal, PRD 8)
6. Kenapa suaranya nggak keluar di HP? (menjelaskan `AudioContext`, PRD 7.2)
7. Bisa main lebih dari sekali sehari?

Tidak ada `Apakah data saya aman?` atau `Bisa batal langganan kapan saja?`. Produk ini tidak punya langganan dan tidak mengumpulkan data pribadi, jadi pertanyaan itu akan jadi pertanyaan palsu.

---

## 10. Gerakan

Dial MOTION 1. Gerakan hanya muncul sebagai respons terhadap tindakan atau perubahan keadaan nyata. Tidak ada animasi yang berjalan terus tanpa pemicu (R-19).

| Gerakan | Durasi dan easing | Tujuan |
|---|---|---|
| Playhead di tangga petunjuk | Sepanjang durasi klip, linear | Menunjukkan posisi waktu di dalam klip. Ini satu-satunya gerakan yang berjalan sendiri, dan ia data: berhenti persis saat audio berhenti. |
| Ring glow tombol Putar | `120ms` masuk dan keluar, `ease-out` | Menandai audio sedang berbunyi. |
| Baris riwayat baru | `160ms`, geser 4px ke atas plus fade | Menarik mata ke baris yang baru ditambahkan, supaya pemain melihat konsekuensi tebakannya. Hanya baris baru yang bergerak, baris lama diam. |
| Segmen tangga terbuka | `200ms`, isi melebar dari kiri | Memperlihatkan bahwa durasi bertambah. |
| Drawer dan sheet | `220ms`, `cubic-bezier(0.2, 0, 0, 1)` | Menunjukkan dari arah mana panel datang, supaya pemain tahu ke mana ia akan kembali. |
| Dialog reveal | `180ms`, fade plus skala `0.98` ke `1` | Perubahan konteks dari bermain ke hasil. |
| Denyut tombol Putar di kunjungan pertama | `600ms`, **satu kali** | Menunjukkan di mana game dimulai. Berjalan sekali lalu berhenti permanen, dan tidak muncul lagi di kunjungan berikutnya (disimpan di `localStorage`). |

Tidak ada: parallax, scroll-reveal bertingkat, elemen mengapung, bounce, elemen yang muncul satu per satu saat digulir, tumpukan Fade Up plus Scale plus Float.

Semua gerakan dinonaktifkan di bawah `@media (prefers-reduced-motion: reduce)`, **kecuali** playhead, yang diganti dengan langkah diskrit per 10% durasi karena ia membawa informasi yang tidak bisa dihapus.

---

## 11. Aksesibilitas

### 11.1 Keyboard (R-32)

- Urutan Tab mengikuti urutan visual: wordmark, toggle bahasa, Menu, Putar, Lewatin, Nyerah, input, Tebak, lalu baris riwayat (sebagai daftar, bukan sebagai kontrol).
- `Spasi` dan `Enter` mengaktifkan semua tombol. Shortcut tambahan: `P` memutar ulang klip, karena kontrol itu dipakai berulang dan pemain sering sedang mengetik di field. Shortcut didaftarkan di FAQ supaya bukan rahasia.
- `Escape` menutup drawer, sheet, dialog reveal, dan daftar autocomplete.
- Focus ring: 2px `--kaset-500` dengan `outline-offset: 2px`. Tidak ada `outline: none` tanpa pengganti. Di dalam elemen yang sudah berwarna `--kaset-500`, focus ring berubah ke `--ink-50` supaya tetap terlihat.
- Fokus dikurung di dalam drawer dan dialog selama terbuka, lalu dikembalikan ke elemen pemicunya.

### 11.2 Pembaca layar

- Angka durasi aktif dan pesan keadaan berada di dalam `aria-live="polite"`, jadi perubahan durasi dan hasil tebakan dibacakan tanpa perlu memindah fokus.
- Tangga petunjuk diberi `role="group"` dengan `aria-label` yang menyebut keadaannya dalam kata, misalnya `Petunjuk: 2 detik dari 5 tahap`. Segmennya sendiri `aria-hidden`, karena bentuknya adalah representasi dari label itu.
- Tombol Putar menyertakan durasi di nama aksesibelnya: `Putar klip 0,1 detik`, bukan hanya `Putar`.
- Cover art diberi `alt` berisi `Cover album {judul} oleh {artis}` di panel reveal, dan `alt=""` di tempat lain karena di sana ia dekoratif.
- Pemisah tangga petunjuk di halaman konten `aria-hidden`.

### 11.3 Audio dan aksesibilitas

Game ini menuntut pendengaran, dan itu batasan nyata yang tidak bisa dihilangkan desain. Yang bisa dilakukan: tidak menambah hambatan kedua. Jadi semua informasi non-audio (durasi, sisa tebakan, status tebakan, jawaban) selalu tersedia sebagai teks, tidak pernah hanya sebagai warna atau hanya sebagai suara.

---

## 12. Tampilan Teks Dua Bahasa

Ini bagian desain dari PRD 4.4, bukan ulangan spesifikasi teknisnya.

- **Toggle bahasa terlihat di bilah atas**, bukan tersembunyi di drawer, karena pemain yang membuka situs dengan bahasa yang salah harus bisa memperbaikinya tanpa mencari (PRD R-14).
- Bentuknya dua segmen `ID | EN` dengan segmen aktif berisi `--kaset-700`. Bukan dropdown, karena hanya ada dua pilihan, dan bukan bendera, karena bahasa bukan negara.
- **Layout wajib tahan terhadap panjang teks yang berbeda.** Teks Indonesia nonformal sering lebih panjang dari Inggris (`Bagiin hasil` melawan `Share`). Jadi: tidak ada lebar tombol yang dikunci px, label tombol boleh membungkus jadi dua baris tanpa merusak tinggi baris kontrol, dan setiap komponen diuji di kedua bahasa pada lebar 320px.
- Angka durasi (`0.1s`) **tidak** diterjemahkan formatnya di UI utama agar konsisten dengan nilai teknis, tapi pemisah desimal pada teks naratif mengikuti bahasa (`0,1 detik` di Indonesia, `0.1 seconds` di Inggris). Aturan ini ditulis supaya tidak jadi inkonsistensi yang ditemukan belakangan.
- Semua teks di dokumen ini yang muncul di antarmuka adalah **usulan isi untuk `locales/id.json` dan `locales/en.json`**, bukan string yang di-hardcode (PRD R-15).

### Catatan gaya bahasa

Gaya Indonesia nonformal sesuai PRD R-16: `kamu` bukan `Anda`, `yuk` bukan `silakan`. Yang perlu dijaga: nonformal bukan berarti berteriak. Pesan error tetap tenang dan menyebut tindakan berikutnya; keakrabannya ada di pilihan kata, bukan di tanda seru.

**Tidak ada emoji di teks mana pun** (keputusan pemilik, Bagian 14.1). Ini berlaku untuk kedua file terjemahan, label tombol, judul, pesan status, pesan error, keadaan kosong, dan teks share. Contoh string beremoji di PRD 6.2 dan 6.3 tidak dipakai.

Tanda em dash (`—`) tidak dipakai di seluruh teks antarmuka. Pengganti: koma, titik dua, atau tanda kurung.

---

## 13. Aset: yang Ada, yang Placeholder

Tidak ada aset yang dibuat tanpa konfirmasi pemilik produk, dan tidak ada placeholder yang disamarkan sebagai final (R-23, R-38).

| Aset | Status | Keputusan sementara |
|---|---|---|
| **Logo / wordmark** | `[PERLU KONFIRMASI PEMILIK]` | Sampai ada arahan: wordmark teks `TebakLagu` dengan Plus Jakarta Sans weight 800, suku kata `Tebak` berwarna `--ink-50` dan `Lagu` berwarna `--kaset-500`. Ini placeholder tipografis yang jujur, bukan logo yang diklaim final. Konsep, bentuk, dan warna logo final adalah keputusan pemilik. |
| **Favicon / ikon aplikasi** | `[PERLU KONFIRMASI PEMILIK]`, penanda sementara sudah dipasang | Yang terpasang sekarang: tiga segmen tangga petunjuk (Bagian 3) di atas `--ink-900`, di `src/app/icon.svg`. Komentar di dalam file itu menyatakan statusnya sebagai penanda sementara, bukan final. |
| **Cover art lagu** | Nyata | Diambil dari API iTunes atau Deezer bersama metadata lagu (PRD 7.1). Tidak dibuat sendiri. |
| **Avatar / foto orang** | Tidak ada | Produk tidak punya akun, profil, atau tim yang ditampilkan. Tidak ada avatar yang dibuat. |
| **Angka publik (jumlah pemain, uptime)** | Tidak ditampilkan | Belum ada data nyata (R-17). Statistik yang ditampilkan hanya milik pemain sendiri dari `localStorage`, dan itu nyata. |
| **Testimoni** | Tidak ada bagiannya | Belum ada testimoni nyata, jadi bagiannya tidak dibuat (R-18). |
| **Logo mitra / "dipercaya oleh"** | Tidak ada | Tidak ada mitra. Bagiannya tidak dibuat (R-36). |
| **Ilustrasi** | Tidak ada | Lihat Bagian 8.6 dan 9.2. Yang dipakai hanya tujuh ikon fungsional dan cover art asli. |

---

## 14. Keputusan Pemilik atas Konflik dengan PRD

Dua hal di `PRD.md` berbenturan dengan aturan filter. Keduanya sudah diputuskan pemilik produk dan dicatat di sini (R-37).

### 14.1 Emoji di dalam teks antarmuka

**Yang diminta PRD:** contoh string di PRD 6.2 dan 6.3 memakai emoji di teks UI, yaitu emoji perayaan di akhir `"correct"` dan emoji senyum berkeringat di tengah `"wrong"`. PRD 6.4 juga menyatakan "boleh pakai emoji". Karakter aslinya tidak dikutip di dokumen ini supaya dokumen direction pun bebas emoji.

**Aturan yang bertabrakan:** R-04 lewat skill UI, yang melarang emoji sebagai dekorasi di teks antarmuka karena ia bersaing dengan isi dan meratakan suara produk.

**Keputusan pemilik (2026-10-05): tidak memakai emoji di teks, tanpa pengecualian.** Aturan R-04 berlaku penuh dan contoh string di PRD 6.2, 6.3, dan izin di PRD 6.4 tidak diikuti.

Konsekuensi yang mengikat implementasi:

- Tidak ada emoji di `locales/id.json` dan `locales/en.json`. Pesan status ditulis tanpa emoji: `"correct": "Mantap, bener!"`, `"wrong": "Belum pas, coba lagi"`.
- Tidak ada emoji di label tombol, judul, badge, pesan error, keadaan kosong, maupun teks onboarding.
- **Teks share juga tanpa emoji.** Pola kotak memakai karakter blok geometris Unicode (`░ ▓ █`), bukan emoji kotak berwarna. Spesifikasinya di Bagian 8.5.
- Informasi yang sebelumnya dibawa emoji sudah dibawa tiga lapisan lain yang lebih bisa dipercaya: warna semantik (`--pandan-400` dan `--bata-400`), ikon status dari Bagian 8.6, dan teks pesannya sendiri. Jadi penghapusan emoji tidak menghilangkan informasi apa pun.
- Gaya nonformal tetap dipertahankan sepenuhnya (PRD R-16). Keakrabannya ada di pilihan kata (`kamu`, `yuk`, `bener`), bukan di emoji.

### 14.2 Nama pemilik produk

`PRD.md` mencantumkan **Pemilik Produk: (isi nama)**, yang kosong saat dokumen ini pertama ditulis.

**Keputusan pemilik (2026-10-05): nama pemilik produk adalah Sharam.**

Nama ini dipakai sebagai pihak yang bertanggung jawab di `/privasi` dan `/ketentuan`. Penanda `[NAMA PEMILIK]` dihapus dari kedua halaman. Tidak ada nama, badan hukum, atau alamat lain yang ditambahkan di luar ini: kalau halaman legal butuh alamat atau kontak, itu ditanyakan dulu, tidak dikarang (R-38).

---

## 15. Catatan Alasan (R-31)

Satu baris per keputusan besar. Keputusan yang tidak bisa diringkas satu baris dicabut, bukan dipertahankan.

| Keputusan | Alasan satu baris |
|---|---|
| Basis gelap permanen sebagai default | Sesi main paling sering malam, pembuat konten merekam di latar gelap, dan layar yang sama ditatap berulang kali dalam satu sesi. |
| Amber pita kaset sebagai warna merek | Katalog produk ini bertumpu pada lagu Indonesia termasuk nostalgia, dan pita kaset adalah benda konkret dari dunia itu. |
| Hijau pandan sebagai satu-satunya aksen | Supaya kemunculan warna itu di layar selalu berarti satu hal: pemain benar. |
| Merah bata dibatasi ke error dan tebakan salah | Agar warna itu tidak pernah jadi dekorasi dan selalu bisa dipercaya sebagai peringatan. |
| Plus Jakarta Sans untuk antarmuka | Asal Indonesia yang cocok dengan pasar produk, dan x-height-nya menjaga keterbacaan pada 14px di HP. |
| IBM Plex Mono dibatasi ke angka dan teks share | Durasi dan riwayat tersusun sebagai kolom angka yang harus rata, dan teks share dirender dengan lebar tetap di aplikasi chat. |
| Tangga petunjuk sebagai motif identitas | Ia adalah mekanik inti produk dalam bentuk gambar, jadi tidak bisa dipindah ke produk lain tanpa kehilangan makna. |
| Lebar segmen tangga tidak sama | Perbandingan durasi adalah informasi, dan lebar adalah cara paling langsung menyampaikannya. |
| Tombol Putar satu-satunya elemen bulat | Bentuknya sendiri sudah menjadikannya titik fokus, tanpa perlu warna atau ukuran tambahan. |
| Glow hanya saat audio berbunyi | Glow adalah penguat perhatian, dan satu-satunya momen yang pantas diperkuat adalah detik yang harus didengar. |
| Satu gradien, hanya pada playhead | Gradien di situ memetakan waktu dari awal ke ujung durasi, jadi ia membawa besaran, bukan menghias. |
| Blur hanya pada overlay drawer | Blur dipakai sekali untuk memundurkan lapisan, bukan sebagai karakter semua permukaan. |
| Shadow hanya pada drawer dan dialog | Hanya dua elemen itu yang benar-benar melayang di atas halaman, jadi elevasi masih berarti sesuatu. |
| Game di atas, penjelasan di bawah | Pemain datang untuk main, bukan untuk membaca tentang game. |
| Panel game tidak melebar di atas 1152px | Memperlebar panel hanya menjauhkan tombol dari mata tanpa menambah informasi. |
| Riwayat sebagai baris, bukan kartu | Riwayat adalah urutan yang dibaca dari atas ke bawah, dan baris penuh lebar lebih cepat dipindai daripada grid kartu. |
| Lima keadaan responsif, bukan dua | Lebar tablet dan laptop kecil adalah rentang nyata yang akan mewarisi keadaan yang salah kalau hanya ada dua. |
| Padding bagian diperkecil di HP | Padding yang disetel untuk kanvas lebar berubah jadi gulungan melewati ruang kosong di layar kecil. |
| Menu jadi sheet dari bawah di HP | Ibu jari ada di bawah layar, dan menu adalah satu-satunya jalan ke semua pengaturan. |
| Tombol Menu selalu berlabel teks | Menu memuat satu-satunya akses ke pengaturan dan halaman legal, jadi keberadaannya tidak boleh bergantung pada pengenalan ikon. |
| Layout Rapat dipilih manual, bukan otomatis per lebar | Itu keputusan pembuat konten tentang framing video, bukan konsekuensi ukuran perangkat. |
| Tidak ada panah di tombol | Tidak ada tombol di produk ini yang memindahkan pemain ke tempat lain secara harfiah. |
| Tidak ada ikon di samping judul bagian | Label bagiannya sudah mengerjakan tugas itu. |
| Tujuh ikon digambar sendiri, bukan diimpor dari satu pustaka | Jumlahnya sedikit, dan tampilan seragam pustaka default adalah penanda yang ingin dihindari. |
| Pesan error dipisah per penyebab | CORS, offline, dan `AudioContext` punya tindakan pemulihan yang berbeda, jadi satu pesan generik akan menyesatkan. |
| Toggle bahasa di bilah atas, bukan di drawer | Pemain yang membuka situs dengan bahasa salah harus bisa memperbaikinya tanpa mencari. |
| Statistik hanya milik pemain sendiri | Itu satu-satunya angka yang nyata di produk ini. |
| Footer satu kolom | Produk ini hanya punya satu kelompok tautan. |
| Playhead dikecualikan dari reduced-motion | Ia membawa informasi posisi waktu, jadi diganti langkah diskrit, tidak dihapus. |
| Setelah ronde selesai, Lewatin dan Nyerah diganti Putar lagi dan Lihat jawabannya | Panel reveal bisa ditutup, dan layar tidak boleh menyisakan kontrol mati tanpa jalan ke ronde berikutnya. |
| Pengaturan jadi kolom kiri permanen di desktop, bukan drawer | Genre, era, kesulitan, dan volume diubah di tengah bermain, dan drawer menambah dua ketukan untuk setiap perubahan di layar yang ruangnya justru kosong. |
| Statistik jadi kolom kanan di desktop | Ia data yang dibaca, bukan kontrol yang ditekan, jadi memisahkannya menjaga kolom tengah sebagai satu-satunya tempat tindakan. |
| Tombol Menu tidak dirender di desktop, bukan disembunyikan | Kontrol yang tidak bisa dipakai tidak boleh tetap bisa dijangkau Tab, dan dua jalan ke pengaturan yang sama membuat pemain menebak. |
| Panel samping dibuat lebih tenang dari kolom tengah | Supaya titik fokus tetap satu, dan itu tombol Putar. |
| Panel samping tidak dirender di layout Rapat | Rapat untuk merekam video vertikal, dan panel samping akan terpotong frame. |
| Scrollbar panel kiri dipindah ke tepi kiri | Di tepi kanan ia berdiri di celah yang tugasnya memisahkan kolom pengaturan dari kolom game, jadi ia mengaburkan pemisahan yang sedang dikerjakan celah itu. |
| Scrollbar memakai `--kaset-700`, bukan `--kaset-500` | Amber terang dikunci sebagai penanda keadaan game, dan scrollbar tidak menandai keadaan apa pun; tingkat terang baru dipakai saat hover, tempat ada interaksi nyata. |
| Teks panel diberi padding 10px di sisi scrollbar | Browser dengan overlay scrollbar menggambarnya di atas isi tanpa menempati ruang, jadi tanpa padding itu teks berada di bawahnya. |
| Lagu tanpa preview dijawab 200 dengan `playable: false`, bukan 404 | Sumber dayanya ada di katalog, yang tidak ada hanya previewnya, dan 404 untuk kondisi yang sudah ditangani hanya menimbulkan error di konsol pemain. |
| Tidak ada emoji di teks mana pun | Keputusan pemilik, dan informasi yang dibawanya sudah dipegang warna semantik, ikon status, serta teks pesannya sendiri. |
| Pola share memakai `░ ▓ █`, bukan emoji kotak | Lebarnya tetap di font monospace, artinya dibawa kepadatan karakter bukan warna, dan produk ini tidak memakai emoji. |

---

## 16. Daftar Periksa Sebelum Serah Terima

Dijalankan bersama Delivery Gate di `antislop` core, bukan sebagai penggantinya. Semua wajib terverifikasi, bukan diperkirakan.

**Hard Gate**
- [ ] Tidak ada em dash (`—`) di seluruh teks antarmuka dan file terjemahan.
- [ ] Tidak ada emoji di seluruh teks antarmuka, kedua file terjemahan, dan teks share. Pola share memakai `░ ▓ █`.
- [ ] Nama pemilik produk (Sharam) terisi di `/privasi` dan `/ketentuan`, dan tidak ada data pemilik lain yang dikarang.
- [ ] Nol gulir horizontal pada 320px, di kedua bahasa, di kedua tema, di kedua layout.
- [ ] Tidak ada angka atau klaim tanpa sumber nyata. Statistik yang tampil hanya dari `localStorage` pemain.
- [ ] Tidak ada testimoni, avatar, atau logo mitra.
- [ ] Logo dan favicon masih bertanda `[PERLU KONFIRMASI PEMILIK]` sampai pemilik memutuskan.
- [ ] Setiap item menu punya tujuan nyata, atau berlabel "Segera" dan tidak bisa ditekan.
- [ ] Kontras diukur dengan alat, bukan ditaksir: teks normal 4.5:1, teks besar 3:1, segmen tangga bersebelahan 3:1.
- [ ] Setiap kontrol punya perilaku nyata. Tidak ada tombol mati.
- [ ] Keadaan kosong, memuat, dan error ada untuk game, autocomplete, dan statistik, dan masing-masing menyebut penyebab plus tindakan.
- [ ] FAQ hanya memuat tujuh pertanyaan spesifik produk dari Bagian 9.4.
- [ ] Tab, Enter, Spasi, dan Escape berfungsi di seluruh produk, dengan focus ring yang terlihat di mana-mana.
- [ ] Tema terang dan gelap keduanya utuh, diuji komponen per komponen.
- [ ] Halaman `/privasi` dan `/ketentuan` ada dan terisi.
- [ ] Setiap kontrol diklik satu per satu dan hasilnya dicatat sebagai bukti.

**Purpose-Gate**
- [ ] Gradien hanya satu, hanya di playhead.
- [ ] Glow hanya satu, hanya saat audio berbunyi.
- [ ] Blur hanya satu, hanya di overlay drawer.
- [ ] Shadow hanya di drawer dan dialog.
- [ ] Monospace hanya di angka, satuan durasi, dan teks share.
- [ ] Tidak ada latar grid, blueprint, atau pola titik.
- [ ] Tidak ada panah dekoratif di tombol.
- [ ] Tidak ada badge kapsul tanpa fungsi dan tidak ada pil di atas judul.
- [ ] Radius memakai empat nilai dari Bagian 5.1, dan `--r-round` hanya di tombol Putar.
- [ ] Tidak ada ilustrasi generik.
- [ ] Gerakan sesuai tabel Bagian 10, tanpa loop tanpa pemicu.

**Liveliness**
- [ ] Dial ENERGY 2 / RHYTHM 2 / MOTION 1 dinyatakan dan hasilnya konsisten dengannya.
- [ ] Setiap layar punya satu titik fokus yang jelas.
- [ ] Tiga register ruang dari Bagian 5.2 benar-benar berbeda di hasil akhir.
- [ ] Satu aksen (`--pandan-400`) hanya muncul di momen benar.
- [ ] Tangga petunjuk muncul di kelima tempat dari Bagian 3.
- [ ] Bagian Cara Main, Genre, dan pertanyaan memakai komposisi yang berbeda satu dengan lainnya.

**Craftsmanship**
- [ ] Tidak ada keputusan yang alasannya hanya "begitu biasanya".
- [ ] Tidak ada bagian yang ada hanya karena template biasanya punya.
- [ ] Kalau wordmark diganti, produk ini masih punya karakter sendiri lewat tangga petunjuk, amber kaset, dan tipografinya.
- [ ] Palet tidak melewati 2 inti + 1 aksen + 1 semantik fungsional.
- [ ] Hasilnya bukan tiruan Linear, Vercel, Spotify, atau songspot.net.
- [ ] Setiap baris di Bagian 15 masih benar terhadap hasil akhir.
