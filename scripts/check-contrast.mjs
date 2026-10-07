// Memeriksa rasio kontras WCAG untuk pasangan warna yang benar-benar dipakai,
// di kedua tema. Ada karena R-25 menuntut kontras diukur, bukan ditaksir, dan
// karena design.md 2.2 mencantumkan angka yang harus bisa dibuktikan.
//
// Ambang: 4.5:1 teks normal, 3:1 teks besar dan pembedaan antar segmen
// yang bersebelahan.

const T = {
  "ink-900": "#0c0b0a",
  "ink-800": "#141210",
  "ink-700": "#1e1b18",
  "ink-600": "#2b2723",
  "ink-500": "#3d3832",
  "ink-200": "#a8a09a",
  "ink-50": "#f2eee9",
  "kaset-500": "#e4a84c",
  "kaset-700": "#8a5f1e",
  "pandan-400": "#5fd39b",
  "pandan-700": "#084a30",
  "bata-400": "#e07a6b",
  "bata-700": "#b33a28",
  "paper-50": "#f7f3ec",
  "paper-0": "#ffffff",
  "paper-100": "#efe9df",
  "paper-300": "#d9d1c6",
  "paper-400": "#b8ac9c",
  "paper-700": "#3a342d",
  "paper-900": "#1c1917",
  "ladder-idle-light": "#5f574d",
};

function channel(part) {
  const value = part / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * (n & 255)
  );
}

function ratio(a, b) {
  const la = luminance(T[a]);
  const lb = luminance(T[b]);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const CHECKS = [
  // tema, peran, fg, bg, ambang
  ["gelap", "teks utama di latar", "ink-50", "ink-900", 4.5],
  ["gelap", "teks utama di panel", "ink-50", "ink-800", 4.5],
  ["gelap", "teks utama di field", "ink-50", "ink-700", 4.5],
  ["gelap", "teks sekunder di latar", "ink-200", "ink-900", 4.5],
  ["gelap", "teks sekunder di panel", "ink-200", "ink-800", 4.5],
  ["gelap", "placeholder di field", "ink-200", "ink-700", 4.5],
  ["gelap", "angka durasi di latar", "kaset-500", "ink-900", 4.5],
  ["gelap", "teks merek di panel", "kaset-500", "ink-800", 4.5],
  ["gelap", "teks di tombol primer", "ink-900", "kaset-500", 4.5],
  ["gelap", "teks di chip terpilih", "ink-50", "kaset-700", 4.5],
  ["gelap", "label benar di panel", "pandan-400", "ink-800", 4.5],
  ["gelap", "label salah di panel", "bata-400", "ink-800", 4.5],
  ["gelap", "label salah di latar", "bata-400", "ink-900", 4.5],
  ["gelap", "isian tangga vs latar", "kaset-500", "ink-900", 3],
  ["gelap", "batas tangga terkunci vs latar", "ink-600", "ink-900", 3],

  ["terang", "teks utama di latar", "paper-900", "paper-50", 4.5],
  ["terang", "teks utama di panel", "paper-900", "paper-0", 4.5],
  ["terang", "teks utama di field", "paper-900", "paper-100", 4.5],
  ["terang", "teks sekunder di latar", "paper-700", "paper-50", 4.5],
  ["terang", "teks sekunder di panel", "paper-700", "paper-0", 4.5],
  ["terang", "placeholder di field", "paper-700", "paper-100", 4.5],
  ["terang", "angka durasi di latar", "kaset-700", "paper-50", 4.5],
  ["terang", "teks merek di panel", "kaset-700", "paper-0", 4.5],
  ["terang", "teks di tombol primer", "ink-900", "kaset-500", 4.5],
  ["terang", "teks di chip terpilih", "ink-50", "kaset-700", 4.5],
  ["terang", "label benar di panel", "pandan-700", "paper-0", 4.5],
  ["terang", "label salah di panel", "bata-700", "paper-0", 4.5],
  ["terang", "label salah di latar", "bata-700", "paper-50", 4.5],
  ["terang", "isian tangga vs latar", "kaset-700", "paper-50", 3],
  ["terang", "batas tangga terkunci vs latar", "ladder-idle-light", "paper-50", 3],
];

// Catatan soal pasangan yang TIDAK diperiksa di sini:
// isian satu segmen melawan border segmen lain tidak diukur, karena kedua
// elemen itu dipisahkan jarak 4px berisi latar. Warna yang bersebelahan bagi
// masing-masing adalah latar, dan itulah pasangan yang diperiksa di atas.
// Membandingkan dua elemen yang tidak bersentuhan akan mengukur sesuatu yang
// tidak pernah dilihat mata pemain bersebelahan.

let failed = 0;
for (const [theme, role, fg, bg, min] of CHECKS) {
  const value = ratio(fg, bg);
  const ok = value >= min;
  if (!ok) failed += 1;
  console.log(
    `${ok ? "OK  " : "GAGAL"} [${theme}] ${role}: ${fg} / ${bg} = ${value.toFixed(2)}:1 (min ${min})`,
  );
}

console.log(`\n${CHECKS.length - failed}/${CHECKS.length} pasangan lewat ambang.`);
if (failed > 0) process.exit(1);
