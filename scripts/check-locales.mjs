// Validasi key terjemahan. Dijalankan sebelum build (lihat script "verify" di
// package.json), karena PRD bagian 11 menetapkan terjemahan tidak konsisten
// dicegah dengan validasi otomatis, bukan dengan ketelitian manual.
//
// Tiga hal yang diperiksa, dan semuanya adalah aturan yang sudah ditulis:
//   1. Set key harus identik antar bahasa (PRD 6.4).
//   2. Tidak ada em dash di nilai mana pun (antislop R-02).
//   3. Tidak ada emoji di nilai mana pun (keputusan pemilik, design.md 14.1).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = ["en", "id"];

function flatten(value, prefix = "", out = []) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === "object" && !Array.isArray(child)) {
      flatten(child, path, out);
    } else {
      out.push([path, child]);
    }
  }
  return out;
}

const EMOJI = /\p{Extended_Pictographic}/u;
const problems = [];
const entries = new Map();

for (const locale of LOCALES) {
  const file = join(root, "locales", `${locale}.json`);
  const parsed = JSON.parse(readFileSync(file, "utf8"));
  const flat = flatten(parsed);
  entries.set(locale, new Map(flat));

  for (const [path, value] of flat) {
    if (typeof value !== "string") {
      problems.push(`${locale}: ${path} bukan string`);
      continue;
    }
    if (value.includes("\u2014")) {
      problems.push(`${locale}: ${path} memakai em dash (R-02)`);
    }
    if (EMOJI.test(value)) {
      problems.push(`${locale}: ${path} memakai emoji (design.md 14.1)`);
    }
  }
}

const [base, ...rest] = LOCALES;
const baseKeys = entries.get(base);

for (const locale of rest) {
  const other = entries.get(locale);
  for (const key of baseKeys.keys()) {
    if (!other.has(key)) problems.push(`${locale}: kekurangan key ${key}`);
  }
  for (const key of other.keys()) {
    if (!baseKeys.has(key)) problems.push(`${base}: kekurangan key ${key}`);
  }
}

// Interpolasi harus sama di kedua bahasa, kalau tidak satu bahasa akan
// menampilkan placeholder mentah ke pemain.
for (const [key, value] of baseKeys) {
  const vars = (text) =>
    [...String(text).matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort().join(",");
  for (const locale of rest) {
    const other = entries.get(locale).get(key);
    if (other === undefined) continue;
    if (vars(value) !== vars(other)) {
      problems.push(`${key}: variabel interpolasi beda antara ${base} dan ${locale}`);
    }
  }
}

if (problems.length > 0) {
  console.error(`check-locales: ${problems.length} masalah ditemukan\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(
  `check-locales: ${baseKeys.size} key cocok di ${LOCALES.length} bahasa, tanpa em dash dan tanpa emoji.`,
);
