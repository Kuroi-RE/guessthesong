// Dijalankan dengan `npm test` memakai test runner bawaan Node.
// Yang diuji adalah bagian yang paling mudah rusak tanpa terlihat rusak:
// pencocokan jawaban, pola share, dan allowlist host proxy audio.

import { strict as assert } from "node:assert";
import test from "node:test";

import {
  editDistance,
  isCorrectGuess,
  normalize,
  squeeze,
  suggest,
  typoBudget,
} from "../src/lib/matching.ts";
import { buildShareText, ladderWeights, formatClip } from "../src/lib/game.ts";
import { isAllowedAudioUrl } from "../src/lib/itunes.ts";
import type { CatalogSong } from "../src/lib/catalog-types.ts";

const sepatu: CatalogSong = {
  id: "tulus-sepatu",
  title: "Sepatu",
  artist: "Tulus",
  year: 2014,
  genre: "pop-id",
  tier: 1,
};

const babyOneMoreTime: CatalogSong = {
  id: "britney",
  title: "...Baby One More Time",
  artist: "Britney Spears",
  altTitles: ["Baby One More Time"],
  year: 1998,
  genre: "pop-intl",
  tier: 1,
};

const tt: CatalogSong = {
  id: "twice-tt",
  title: "TT",
  artist: "TWICE",
  year: 2016,
  genre: "k-pop",
  tier: 1,
};

test("normalisasi mengabaikan huruf besar, tanda baca, dan spasi ganda", () => {
  assert.equal(normalize("  ...Baby   One More Time! "), "baby one more time");
  assert.equal(normalize("Hati-Hati di Jalan"), "hati hati di jalan");
});

test("jawaban benar diterima apa adanya dan tanpa tanda baca", () => {
  assert.ok(isCorrectGuess(sepatu, "Sepatu"));
  assert.ok(isCorrectGuess(sepatu, "sepatu"));
  assert.ok(isCorrectGuess(babyOneMoreTime, "Baby One More Time"));
  assert.ok(isCorrectGuess(babyOneMoreTime, "...Baby One More Time"));
});

test("judul alternatif diterima (PRD R-05)", () => {
  assert.ok(isCorrectGuess(babyOneMoreTime, "baby one more time"));
});

test("typo kecil dimaafkan pada judul panjang", () => {
  assert.ok(isCorrectGuess(babyOneMoreTime, "Baby One More Tim"));
  assert.ok(isCorrectGuess(sepatu, "sepath"));
});

test("judul pendek tidak memaafkan satu huruf, karena itu judul lain", () => {
  assert.equal(typoBudget(2), 0);
  assert.ok(!isCorrectGuess(tt, "TX"));
  assert.ok(isCorrectGuess(tt, "tt"));
});

test("lagu yang berbeda tetap salah", () => {
  assert.ok(!isCorrectGuess(sepatu, "Monokrom"));
  assert.ok(!isCorrectGuess(sepatu, ""));
});

test("editDistance berhenti di ambang, tidak menghitung lebih jauh", () => {
  assert.equal(editDistance("sepatu", "sepatu", 2), 0);
  assert.equal(editDistance("sepatu", "sepath", 2), 1);
  assert.ok(editDistance("sepatu", "monokrom", 2) > 2);
});

test("saran mengutamakan judul yang diawali teks yang diketik", () => {
  const pool = [babyOneMoreTime, sepatu, tt];
  const hits = suggest("ba", pool);
  assert.equal(hits[0]?.song.id, "britney");
});

test("saran butuh minimal dua karakter", () => {
  assert.equal(suggest("s", [sepatu]).length, 0);
  assert.equal(suggest("se", [sepatu]).length, 1);
});

test("rentang tebal dihitung pada judul asli, bukan pada bentuk ternormalisasi", () => {
  const hit = suggest("baby", [babyOneMoreTime])[0];
  assert.ok(hit);
  assert.ok(hit.titleHighlight);
  assert.equal(
    babyOneMoreTime.title
      .slice(hit.titleHighlight.from, hit.titleHighlight.to)
      .toLowerCase(),
    "baby",
  );
});

test("mencari nama artis mengembalikan lagu artis itu", () => {
  const monokrom: CatalogSong = { ...sepatu, id: "tulus-monokrom", title: "Monokrom" };
  const hits = suggest("tulus", [babyOneMoreTime, sepatu, monokrom, tt]);
  assert.equal(hits.length, 2);
  assert.deepEqual(
    hits.map((hit) => hit.song.id).sort(),
    ["tulus-monokrom", "tulus-sepatu"],
  );
});

test("kecocokan artis menebalkan nama artis, bukan judulnya", () => {
  const hit = suggest("brit", [babyOneMoreTime])[0];
  assert.ok(hit);
  assert.equal(hit.titleHighlight, null);
  assert.ok(hit.artistHighlight);
  assert.equal(
    babyOneMoreTime.artist
      .slice(hit.artistHighlight.from, hit.artistHighlight.to)
      .toLowerCase(),
    "brit",
  );
});

test("kecocokan judul diutamakan di atas kecocokan artis", () => {
  // "Sepatu" oleh Tulus, dan satu lagu artis bernama "Sepatu Band".
  const sepatuBand: CatalogSong = {
    ...tt,
    id: "sepatu-band-lagu",
    title: "Lagu Apa Saja",
    artist: "Sepatu Band",
  };
  const hits = suggest("sepatu", [sepatuBand, sepatu]);
  assert.equal(hits[0]?.song.id, "tulus-sepatu");
  assert.equal(hits[1]?.song.id, "sepatu-band-lagu");
});

test("artis dengan ejaan beda huruf besar dan tanda baca tetap ketemu", () => {
  const sigit: CatalogSong = {
    ...tt,
    id: "the-sigit-black-amplifier",
    title: "Black Amplifier",
    artist: "The S.I.G.I.T.",
  };
  assert.equal(suggest("sigit", [sigit]).length, 1);
  assert.equal(suggest("THE S.I.G.I.T", [sigit]).length, 1);
});

test("artis dengan tanda baca tetap ketemu tanpa tanda bacanya", () => {
  const dmasiv: CatalogSong = {
    ...tt,
    id: "dmasiv-cinta-ini-membunuhku",
    title: "Cinta Ini Membunuhku",
    artist: "D'Masiv",
  };
  const hit = suggest("dmasiv", [dmasiv])[0];
  assert.ok(hit, "mengetik dmasiv harus menemukan D'Masiv");
  assert.ok(hit.artistHighlight, "nama artis harus ditebalkan");
  assert.equal(
    squeeze(
      dmasiv.artist.slice(hit.artistHighlight.from, hit.artistHighlight.to),
    ),
    "dmasiv",
  );
});

test("judul dengan tanda baca diterima walau pemain tidak mengetiknya", () => {
  const godsPlan: CatalogSong = {
    ...tt,
    id: "drake-gods-plan",
    title: "God's Plan",
    artist: "Drake",
  };
  assert.ok(isCorrectGuess(godsPlan, "gods plan"));
  assert.ok(isCorrectGuess(godsPlan, "God's Plan"));
  assert.ok(!isCorrectGuess(godsPlan, "Gods Prank"));
});

test("nama artis tidak diterima sebagai jawaban benar", () => {
  // Yang ditanya game ini judul, jadi mengetik nama artis bukan jawaban.
  assert.ok(!isCorrectGuess(sepatu, "Tulus"));
});

test("lebar segmen tangga naik dari segmen pertama ke terakhir", () => {
  const weights = ladderWeights();
  assert.equal(weights.length, 5);
  for (let i = 1; i < weights.length; i += 1) {
    assert.ok(weights[i]! > weights[i - 1]!);
  }
});

test("durasi diformat tanpa desimal yang tidak perlu", () => {
  assert.equal(formatClip(0.1), "0.1s");
  assert.equal(formatClip(2), "2s");
  assert.equal(formatClip(15), "15s");
});

test("teks share memakai blok geometris, bukan emoji, dan tanpa judul lagu", () => {
  const text = buildShareText({
    attempts: [
      { outcome: "wrong", guessTitle: "Monokrom", step: 0 },
      { outcome: "skipped", guessTitle: "", step: 1 },
      { outcome: "correct", guessTitle: "Sepatu", step: 2 },
    ],
    status: "won",
    productName: "TebakLagu",
    dateLabel: "05/10",
    resultLine: "benar di 2s",
    siteLabel: "contoh.test",
  });

  assert.ok(text.includes("\u2593\u2593\u2588\u2591\u2591"));
  assert.ok(!/\p{Extended_Pictographic}/u.test(text));
  assert.ok(!text.includes("Sepatu"));
  assert.ok(!text.includes("Monokrom"));
  assert.ok(!text.includes("\u2014"));
});

test("pola share untuk ronde yang gagal tidak punya blok penuh", () => {
  const text = buildShareText({
    attempts: [0, 1, 2, 3, 4, 4].map((step) => ({
      outcome: "wrong" as const,
      guessTitle: "x",
      step,
    })),
    status: "lost",
    productName: "TebakLagu",
    dateLabel: "05/10",
    resultLine: "nggak ketebak",
    siteLabel: "contoh.test",
  });
  assert.ok(!text.includes("\u2588"));
  assert.ok(text.includes("\u2593\u2593\u2593\u2593\u2593"));
});

test("proxy audio hanya menerima host CDN Apple lewat https", () => {
  assert.ok(
    isAllowedAudioUrl(
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/x/mzaf_1.m4a",
    ),
  );
  assert.ok(isAllowedAudioUrl("https://is1-ssl.mzstatic.com/a.m4a"));

  // Host yang menyerupai tapi bukan milik Apple harus ditolak.
  assert.ok(!isAllowedAudioUrl("https://mzstatic.com.penyerang.net/a.m4a"));
  assert.ok(!isAllowedAudioUrl("https://itunes.apple.com.evil.test/a.m4a"));
  // Protokol dan target internal harus ditolak.
  assert.ok(!isAllowedAudioUrl("http://audio-ssl.itunes.apple.com/a.m4a"));
  assert.ok(!isAllowedAudioUrl("http://169.254.169.254/latest/meta-data/"));
  assert.ok(!isAllowedAudioUrl("file:///etc/passwd"));
  assert.ok(!isAllowedAudioUrl("bukan-url"));
});
