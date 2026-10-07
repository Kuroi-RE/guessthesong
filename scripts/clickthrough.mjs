// Klik-through nyata di browser, bukan inspeksi kode. Ada karena R-35 menuntut
// setiap kontrol benar-benar ditekan dan hasilnya dicatat sebagai bukti.
//
// Dijalankan terhadap server produksi: node scripts/clickthrough.mjs <baseUrl>
// Memakai Microsoft Edge yang sudah ada di mesin ini.

import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3100";
const results = [];
const consoleErrors = [];
// Satu pemeriksaan sengaja membuka rute yang tidak ada, dan Chromium mencatat
// 404 itu sebagai error konsol. Penanda ini memisahkan 404 yang diminta tes
// dari 404 yang berarti ada sumber daya rusak.
let expecting404 = false;

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "OK   " : "GAGAL"} ${name}${detail ? `  (${detail})` : ""}`);
}

async function check(name, fn) {
  try {
    const detail = await fn();
    record(name, true, typeof detail === "string" ? detail : "");
  } catch (error) {
    record(name, false, error instanceof Error ? error.message : String(error));
  }
}

const browser = await chromium.launch({
  channel: "msedge",
  args: ["--autoplay-policy=no-user-gesture-required"],
});

// Locale konteks disetel ke id-ID supaya deteksi navigator.language (PRD R-17)
// menghasilkan bahasa Indonesia, yaitu bahasa pasar utama produk ini.
// Perpindahan ke Inggris diuji terpisah lewat toggle di bilah atas.
//
// Lebar dasarnya 1024px, yaitu keadaan L: satu kolom plus tombol Menu, jalur
// yang dipakai mayoritas perangkat. Keadaan tiga kolom di XL punya bloknya
// sendiri yang menyetel 1440px.
const context = await browser.newContext({
  viewport: { width: 1024, height: 860 },
  locale: "id-ID",
});
const page = await context.newPage();

page.on("console", (message) => {
  if (message.type() !== "error") return;
  if (expecting404 && /404/.test(message.text())) return;
  consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

await page.goto(BASE, { waitUntil: "networkidle" });

// ---------------------------------------------------------------- layar game

await check("judul game dirender", async () => {
  await page.getByRole("heading", { level: 1 }).first().waitFor();
  return (await page.getByRole("heading", { level: 1 }).first().innerText()).slice(0, 48);
});

await check("tombol Putar ada dan menyebut durasi di nama aksesibelnya", async () => {
  const button = page.getByRole("button", { name: /Putar klip 0\.1s/ });
  await button.waitFor({ state: "visible", timeout: 20000 });
  return await button.getAttribute("aria-label");
});

await check("tombol Putar: klik memutar klip, glow aktif, lalu berhenti sendiri", async () => {
  // Diuji pada tahap durasi panjang, bukan pada 0.1s: keadaan berbunyi di 0.1s
  // hanya hidup seratus milidetik dan tidak bisa diamati dengan andal dari luar.
  // Yang diuji di sini perilakunya, dan durasinya dijamin oleh mesin audio.
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole("button", { name: /Lewatin/ }).click();
    await page.waitForTimeout(120);
  }
  const play = page.getByRole("button", { name: /Putar klip 8s/ });
  await play.waitFor({ timeout: 10000 });
  await play.click();

  const stop = page.getByRole("button", { name: /Stop klipnya/ });
  await stop.waitFor({ timeout: 25000 });
  const glowing = await stop.evaluate((node) => node.className.includes("glow-brand"));
  if (!glowing) throw new Error("ring glow tidak aktif saat berbunyi");

  // Dihentikan lewat tombol yang sama, lalu dipastikan glow ikut mati.
  await stop.click();
  const again = page.getByRole("button", { name: /Putar klip/ });
  await again.waitFor({ timeout: 10000 });
  const stillGlowing = await again.evaluate((node) =>
    node.className.includes("glow-brand"),
  );
  if (stillGlowing) throw new Error("glow tetap menyala setelah klip berhenti");
  return "glow hanya menyala selama audio berbunyi";
});

await check("playhead hanya ada saat berbunyi", async () => {
  const before = await page.locator('[data-motion="data"]').count();
  if (before !== 0) throw new Error("playhead ada padahal audio berhenti");
  await page.getByRole("button", { name: /Putar klip/ }).click();
  const stop = page.getByRole("button", { name: /Stop klipnya/ });
  await stop.waitFor({ timeout: 20000 });
  const during = await page.locator('[data-motion="data"]').count();
  if (during !== 1) throw new Error(`playhead=${during} saat berbunyi`);
  await stop.click();
  await page.getByRole("button", { name: /Putar klip/ }).waitFor({ timeout: 10000 });
  const after = await page.locator('[data-motion="data"]').count();
  if (after !== 0) throw new Error("playhead tetap ada setelah berhenti");
  return "0 saat diam, 1 saat berbunyi, 0 lagi setelah berhenti";
});

await check("ronde baru untuk menguji sisa alur dari awal", async () => {
  await page.getByRole("button", { name: /Buka menu/ }).click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: /Acak ulang lagunya/ }).click();
  await page.getByRole("button", { name: /Putar klip 0\.1s/ }).waitFor({ timeout: 25000 });
  return "kembali ke 0.1s";
});

await check("tombol Tebak nonaktif sampai judul dipilih dari daftar", async () => {
  const guess = page.getByRole("button", { name: "Tebak", exact: true });
  if (!(await guess.isDisabled())) throw new Error("Tebak aktif padahal belum memilih");
  const hint = page.getByText("Pilih dulu salah satu judul dari daftar.");
  await hint.waitFor();
  return "nonaktif plus penjelasan teks terlihat";
});

await check("autocomplete: mengetik memunculkan saran dan bagian cocok ditebalkan", async () => {
  const input = page.getByRole("combobox");
  await input.fill("se");
  const options = page.getByRole("option");
  await options.first().waitFor({ timeout: 5000 });
  const count = await options.count();
  if (count === 0 || count > 6) throw new Error(`jumlah saran = ${count}`);
  const bold = await page.locator('[role="option"] strong').count();
  if (bold === 0) throw new Error("tidak ada bagian yang ditebalkan");
  return `${count} saran, maksimal 6`;
});

await check("autocomplete: keyboard ArrowDown dan Enter memilih baris", async () => {
  const input = page.getByRole("combobox");
  await input.press("ArrowDown");
  const activeId = await input.getAttribute("aria-activedescendant");
  if (!activeId) throw new Error("aria-activedescendant tidak diset");
  await input.press("Enter");
  const value = await input.inputValue();
  if (value.toLowerCase() === "se") throw new Error("field tidak terisi judul");
  const guess = page.getByRole("button", { name: "Tebak", exact: true });
  if (await guess.isDisabled()) throw new Error("Tebak masih nonaktif setelah memilih");
  return `terpilih: ${value}`;
});

await check("autocomplete: Escape menutup daftar tanpa mengosongkan field", async () => {
  const input = page.getByRole("combobox");
  await input.fill("se");
  await page.getByRole("option").first().waitFor({ timeout: 5000 });
  await input.press("Escape");
  await page.waitForTimeout(150);
  if ((await page.getByRole("option").count()) !== 0) throw new Error("daftar masih terbuka");
  if ((await input.inputValue()) !== "se") throw new Error("field ikut dikosongkan");
  return "daftar tertutup, teks tetap";
});

await check("autocomplete: mencari nama artis mengembalikan lagu artis itu", async () => {
  const input = page.getByRole("combobox");
  await input.fill("");
  await input.fill("tulus");
  const options = page.getByRole("option");
  await options.first().waitFor({ timeout: 5000 });

  const rows = await options.evaluateAll((nodes) =>
    nodes.map((node) => {
      const spans = node.querySelectorAll("span");
      return {
        title: spans[0]?.textContent?.trim() ?? "",
        artist: spans[1]?.textContent?.trim() ?? "",
        // Yang ditebalkan harus nama artisnya, bukan judulnya.
        boldInTitle: spans[0]?.querySelector("strong") !== null,
        boldInArtist: spans[1]?.querySelector("strong") !== null,
      };
    }),
  );

  if (rows.length === 0) throw new Error("tidak ada hasil untuk nama artis");
  const wrongArtist = rows.filter((row) => !/tulus/i.test(row.artist));
  if (wrongArtist.length > 0) {
    throw new Error(`ada hasil bukan artis itu: ${wrongArtist[0].artist}`);
  }
  if (rows.some((row) => !row.boldInArtist)) {
    throw new Error("nama artis tidak ditebalkan di semua baris");
  }
  if (rows.some((row) => row.boldInTitle)) {
    throw new Error("judul ikut ditebalkan padahal yang cocok artisnya");
  }
  if (rows.some((row) => row.title.length === 0)) {
    throw new Error("ada baris tanpa judul");
  }
  await input.fill("");
  return `${rows.length} lagu: ${rows.map((row) => row.title).join(", ")}`;
});

await check("autocomplete: nama artis bertanda baca ketemu tanpa tanda bacanya", async () => {
  const input = page.getByRole("combobox");
  await input.fill("");
  await input.fill("dmasiv");
  const options = page.getByRole("option");
  await options.first().waitFor({ timeout: 5000 });
  const artist = await options
    .first()
    .locator("span")
    .nth(1)
    .innerText();
  if (!/D'Masiv/i.test(artist)) throw new Error(`artis hasil pertama: ${artist}`);
  await input.fill("");
  return `"dmasiv" menemukan ${artist}`;
});

await check("tombol Tebak: tebakan salah menambah baris riwayat dan menaikkan durasi", async () => {
  const input = page.getByRole("combobox");
  // Dikosongkan dulu: mengisi nilai yang sama tidak memicu perubahan, jadi
  // daftar saran tidak akan terbuka.
  await input.fill("");
  await input.fill("se");
  await page.getByRole("option").first().waitFor({ timeout: 5000 });
  await page.getByRole("option").first().click();
  await page.getByRole("button", { name: "Tebak", exact: true }).click();

  // Dibatasi ke daftar riwayat di dalam panel game: footer dan grid genre juga
  // memakai <li>, jadi menghitung seluruh halaman akan salah.
  const rows = page.locator("#game ul li");
  await rows.first().waitFor({ timeout: 5000 });
  const count = await rows.count();
  const durasi = await page.locator(".tnum.text-clip").first().innerText();
  if (durasi === "0.1s") throw new Error("durasi tidak naik setelah tebakan salah");
  return `riwayat ${count} baris, durasi sekarang ${durasi}`;
});

await check("tombol Lewatin menambah baris berlabel Dilewatin", async () => {
  const before = await page.locator("#game ul li").count();
  await page.getByRole("button", { name: /Lewatin/ }).click();
  await page.locator("#game ul li").nth(before).waitFor({ timeout: 5000 });
  const after = await page.locator("#game ul li").count();
  if (after !== before + 1) throw new Error(`baris ${before} -> ${after}`);
  const text = await page.locator("#game ul li").nth(after - 1).innerText();
  if (!/Dilewatin/.test(text)) throw new Error(`baris terakhir: ${text}`);
  return `${before} -> ${after} baris, baris terakhir Dilewatin`;
});

await check("pesan status menyebut konsekuensi, bukan hanya 'salah'", async () => {
  const live = page.locator('[aria-live="polite"]');
  const text = await live.first().innerText();
  if (!/Sekarang kamu dapat/.test(text)) throw new Error(`pesan: ${text}`);
  return text;
});

await check("tombol Nyerah membuka panel reveal dengan jawaban", async () => {
  await page.getByRole("button", { name: /Nyerah/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ timeout: 5000 });
  const heading = await dialog.getByRole("heading").first().innerText();
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  if (focused !== "H2") throw new Error(`fokus pertama di ${focused}, bukan judul lagu`);
  return `jawaban "${heading}", fokus pertama di judul`;
});

await check("panel reveal: Bagiin hasil menyalin pola blok tanpa judul lagu", async () => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const dialog = page.getByRole("dialog");
  const songTitle = await dialog.getByRole("heading").first().innerText();
  await dialog.getByRole("button", { name: /Bagiin hasil/ }).click();
  await page.getByText(/udah dicopy|Gagal dicopy/).waitFor({ timeout: 5000 });
  const text = await page.evaluate(() => navigator.clipboard.readText());
  if (!/[\u2591\u2592\u2593\u2588]{5}/.test(text)) throw new Error(`pola tidak ada: ${text}`);
  if (text.includes(songTitle)) throw new Error("judul lagu ikut tersalin");
  if (/\p{Extended_Pictographic}/u.test(text)) throw new Error("ada emoji di teks share");
  return text.replace(/\n/g, " | ");
});

await check("panel reveal: Escape menutup dialog", async () => {
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached", timeout: 5000 });
  return "tertutup";
});

await check("ronde selesai: layar tetap punya jalan ke ronde berikutnya", async () => {
  // Panel reveal sudah ditutup dengan Escape di langkah sebelumnya. Yang diuji
  // di sini: layar tidak jadi jalan buntu setelah panelnya hilang.
  const again = page.getByRole("button", { name: "Putar lagi", exact: true });
  await again.waitFor({ timeout: 5000 });
  const seeAnswer = page.getByRole("button", { name: /Lihat jawabannya/ });
  await seeAnswer.waitFor();
  await seeAnswer.click();
  await page.getByRole("dialog").waitFor({ timeout: 5000 });
  await page.keyboard.press("Escape");
  return "Putar lagi dan Lihat jawabannya keduanya aktif";
});

await check("tombol Main lagi memulai ronde baru dari 0.1s", async () => {
  await page.getByRole("button", { name: "Putar lagi", exact: true }).click();
  await page.getByRole("button", { name: /Putar klip 0\.1s/ }).waitFor({ timeout: 25000 });
  const rows = await page.locator("#game ul li").count();
  if (rows !== 0) throw new Error(`riwayat tidak dikosongkan (${rows} baris)`);
  return "durasi balik ke 0.1s, riwayat kosong";
});

await check("statistik tercatat setelah ronde selesai", async () => {
  const stats = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("tebaklagu.stats.v1") ?? "null"),
  );
  if (!stats || stats.played < 1) throw new Error("statistik tidak tersimpan");
  return `played=${stats.played}, streak=${stats.streak}`;
});

// -------------------------------------------------------------------- menu

await check("tombol Menu membuka drawer, Escape menutup dan fokus kembali", async () => {
  const trigger = page.getByRole("button", { name: /Buka menu/ });
  await trigger.click();
  await page.getByRole("dialog").waitFor({ timeout: 5000 });
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached", timeout: 5000 });
  const back = await page.evaluate(
    () => document.activeElement?.getAttribute("aria-label") ?? "",
  );
  if (!/Buka menu/.test(back)) throw new Error(`fokus kembali ke "${back}"`);
  return "fokus kembali ke tombol Menu";
});

await check("tema: Terang mengubah data-theme dan tetap terbaca", async () => {
  await page.getByRole("button", { name: /Buka menu/ }).click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "Terang", exact: true }).click();
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  if (theme !== "light") throw new Error(`data-theme=${theme}`);
  const bg = await page.evaluate(() =>
    getComputedStyle(document.body).backgroundColor,
  );
  return `data-theme=light, body bg=${bg}`;
});

await check("tema terang: glow diganti ring solid, bukan dihapus diam-diam", async () => {
  const shadow = await page.evaluate(() => {
    const style = document.createElement("div");
    style.className = "glow-brand";
    document.body.append(style);
    const value = getComputedStyle(style).boxShadow;
    style.remove();
    return value;
  });
  if (/22px/.test(shadow)) throw new Error("glow blur masih aktif di tema terang");
  return shadow;
});

await check("tema: Gelap kembali bekerja", async () => {
  await page.getByRole("button", { name: "Gelap", exact: true }).click();
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  if (theme !== "dark") throw new Error(`data-theme=${theme}`);
  return "data-theme=dark";
});

await check("filter genre: memilih Dangdut mengubah jumlah lagu yang cocok", async () => {
  const before = await page.getByRole("dialog").getByText(/lagu cocok sama filter ini/).innerText();
  await page.getByRole("button", { name: "Dangdut", exact: true }).click();
  const after = await page.getByRole("dialog").getByText(/lagu cocok sama filter ini/).innerText();
  if (before === after) throw new Error("jumlah tidak berubah");
  return `${before.trim()} -> ${after.trim()}`;
});

await check("filter era dan kesulitan bisa ditekan dan tercatat sebagai terpilih", async () => {
  await page.getByRole("button", { name: "2010-an", exact: true }).click();
  await page.getByRole("button", { name: "Gampang", exact: true }).click();
  const era = await page
    .getByRole("button", { name: "2010-an", exact: true })
    .getAttribute("aria-pressed");
  const diff = await page
    .getByRole("button", { name: "Gampang", exact: true })
    .getAttribute("aria-pressed");
  if (era !== "true" || diff !== "true") throw new Error(`era=${era} difficulty=${diff}`);
  return "aria-pressed=true pada keduanya";
});

await check("keadaan kosong muncul saat kombinasi filter tidak punya lagu", async () => {
  await page.getByRole("button", { name: "K-pop", exact: true }).click();
  await page.getByRole("button", { name: "Sebelum 2000", exact: true }).click();
  const matching = await page.getByRole("dialog").getByText(/lagu cocok sama filter ini/).innerText();
  await page.keyboard.press("Escape");
  await page.getByText("Belum ada lagu yang cocok sama filter ini.").waitFor({ timeout: 8000 });
  await page.getByText("Longgarin filternya biar bisa main lagi.").waitFor();
  return `${matching.trim()}, pesan plus tindakan terlihat`;
});

await check("volume dan Mulai dari bisa diubah", async () => {
  await page.getByRole("button", { name: /Buka menu/ }).click();
  await page.getByRole("dialog").waitFor();
  const slider = page.getByRole("slider");
  await slider.fill("40");
  await page.getByRole("button", { name: "Dari bagian lain", exact: true }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("tebaklagu.settings.v1") ?? "{}"),
  );
  if (Math.round(saved.volume * 100) !== 40) throw new Error(`volume=${saved.volume}`);
  if (saved.startFrom !== "elsewhere") throw new Error(`startFrom=${saved.startFrom}`);
  return `volume=${saved.volume}, startFrom=${saved.startFrom}`;
});

await check("layout Rapat menyembunyikan konten dan menyisakan panel game", async () => {
  await page.getByRole("button", { name: "Rapat", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const howTo = await page.locator("#cara-main").count();
  const footer = await page.locator("footer").count();
  const game = await page.locator("#game").count();
  if (howTo !== 0 || footer !== 0) throw new Error("konten masih dirender di Rapat");
  if (game !== 1) throw new Error("panel game hilang di Rapat");
  return "Cara Main dan footer hilang, panel game tetap";
});

await check("layout Lebar kembali memunculkan konten", async () => {
  await page.getByRole("button", { name: /Buka menu/ }).click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "Lebar", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.locator("#cara-main").waitFor({ timeout: 5000 });
  return "Cara Main kembali";
});

await check("filter dikembalikan ke semula untuk sisa pengujian", async () => {
  await page.getByRole("button", { name: /Buka menu/ }).click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "Semua genre", exact: true }).click();
  await page.getByRole("button", { name: "Semua era", exact: true }).click();
  await page.getByRole("button", { name: "Sedang", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Putar klip 0\.1s/ }).waitFor({ timeout: 25000 });
  return "kembali ke Semua genre, Semua era, Sedang";
});

// ----------------------------------------------------------------- bahasa

await check("toggle bahasa di bilah atas mengganti teks ke Inggris", async () => {
  await page.getByRole("button", { name: "en", exact: true }).click();
  await page.getByRole("button", { name: /Play the 0\.1s clip/ }).waitFor({ timeout: 10000 });
  const lang = await page.evaluate(() => document.documentElement.lang);
  if (lang !== "en") throw new Error(`html lang=${lang}`);
  return "tombol dan atribut lang ikut berubah";
});

await check("pilihan bahasa tersimpan setelah reload", async () => {
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Play the 0\.1s clip/ }).waitFor({ timeout: 25000 });
  return "masih Inggris setelah reload";
});

await check("kembali ke Indonesia", async () => {
  await page.getByRole("button", { name: "id", exact: true }).click();
  await page.getByRole("button", { name: /Putar klip 0\.1s/ }).waitFor({ timeout: 10000 });
  return "kembali ke Indonesia";
});

// --------------------------------------------------------------- keyboard

await check("skip link muncul saat difokus dan menuju game", async () => {
  // Dijalankan di halaman baru supaya penunjuk fokus sekuensial Chromium
  // benar-benar mulai dari awal dokumen, bukan dari kontrol yang terakhir
  // diklik di pemeriksaan sebelumnya.
  const fresh = await context.newPage();
  await fresh.goto(BASE, { waitUntil: "domcontentloaded" });
  await fresh.keyboard.press("Tab");
  const text = await fresh.evaluate(() => document.activeElement?.textContent ?? "");
  if (!/Langsung ke game/.test(text)) {
    await fresh.close();
    throw new Error(`fokus pertama: "${text}"`);
  }
  const ring = await fresh.evaluate(() => {
    const style = getComputedStyle(document.activeElement);
    return `${style.outlineStyle} ${style.outlineWidth}`;
  });
  await fresh.keyboard.press("Enter");
  await fresh.waitForTimeout(300);
  const hash = await fresh.evaluate(() => location.hash);
  await fresh.close();
  if (hash !== "#game") throw new Error(`hash setelah Enter: "${hash}"`);
  return `${text.trim()}, ring ${ring}, Enter menuju ${hash}`;
});

await check("delapan tujuan Tab berurutan semuanya punya focus ring", async () => {
  // Yang dibuktikan di sini hanya ini: setiap elemen yang dijangkau Tab punya
  // ring yang terlihat. Bahwa Tab pertama jatuh ke skip link dibuktikan di
  // pemeriksaan sebelumnya, pada halaman yang benar-benar baru.
  const fresh = await context.newPage();
  await fresh.goto(BASE, { waitUntil: "networkidle" });
  await fresh.getByRole("button", { name: /Putar klip/ }).waitFor({ timeout: 25000 });

  const order = [];
  const ringless = [];
  for (let i = 0; i < 8; i += 1) {
    await fresh.keyboard.press("Tab");
    const info = await fresh.evaluate(() => {
      const node = document.activeElement;
      if (!node || node === document.body) return null;
      const style = getComputedStyle(node);
      return {
        label:
          node.getAttribute("aria-label") ??
          (node.textContent ?? "").trim().slice(0, 22),
        outline: `${style.outlineStyle}:${style.outlineWidth}`,
      };
    });
    if (!info) break;
    order.push(info.label);
    // Ring diperiksa pada fokus keyboard, bukan fokus programatik: focus-visible
    // memang tidak berlaku untuk .focus() dari skrip.
    if (/^none/.test(info.outline) || info.outline.endsWith(":0px")) {
      ringless.push(`${info.label} (${info.outline})`);
    }
  }
  await fresh.close();

  if (ringless.length > 0) throw new Error(`tanpa ring: ${ringless.join(", ")}`);
  return order.join(" > ");
});

await check("tombol Putar bisa diaktifkan dengan keyboard", async () => {
  // Dinaikkan ke tahap 8s dulu, karena keadaan berbunyi di 0.1s hanya hidup
  // seratus milidetik dan tidak bisa diamati dengan andal dari luar.
  await page.getByRole("button", { name: /Putar klip 0\.1s/ }).waitFor({ timeout: 25000 });
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole("button", { name: /Lewatin/ }).click();
    await page.waitForTimeout(120);
  }
  const play = page.getByRole("button", { name: /Putar klip 8s/ });
  await play.waitFor({ timeout: 10000 });
  await play.focus();
  await page.keyboard.press("Enter");
  const stop = page.getByRole("button", { name: /Stop klipnya/ });
  await stop.waitFor({ timeout: 20000 });
  await stop.press("Space");
  await page.getByRole("button", { name: /Putar klip/ }).waitFor({ timeout: 10000 });
  return "Enter memutar, Space menghentikan";
});

await check("shortcut P memutar ulang klip", async () => {
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("p");
  const stop = page.getByRole("button", { name: /Stop klipnya/ });
  await stop.waitFor({ timeout: 20000 });
  await stop.click();
  await page.getByRole("button", { name: /Putar klip/ }).waitFor({ timeout: 10000 });
  return "P memutar klip";
});

// Ring fokus diperiksa di pemeriksaan urutan Tab di atas, pada fokus keyboard
// yang nyata. Memeriksanya lewat .focus() dari skrip akan salah, karena
// :focus-visible memang tidak berlaku untuk fokus programatik.

// -------------------------------------------------- tiga kolom di desktop

await check("di 1440px: tiga kolom tampil dan tombol Menu tidak dirender", async () => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Putar klip/ }).waitFor({ timeout: 25000 });

  const settings = page.getByRole("complementary", { name: "Pengaturan" });
  const stats = page.getByRole("complementary", { name: "Statistik kamu" });
  await settings.waitFor({ timeout: 5000 });
  await stats.waitFor({ timeout: 5000 });

  // Tombol Menu harus benar-benar keluar dari dokumen yang bisa dijangkau,
  // bukan sekadar tak terlihat: kontrol mati yang masih bisa di-Tab adalah
  // kontrol mati (design.md 6.6).
  const menuCount = await page.getByRole("button", { name: /Buka menu/ }).count();
  if (menuCount !== 0) throw new Error(`tombol Menu masih ada (${menuCount})`);

  const geometry = await page.evaluate(() => {
    const pick = (label) =>
      document.querySelector(`[aria-label="${label}"]`)?.getBoundingClientRect();
    const left = pick("Pengaturan");
    const game = document.querySelector("#game")?.getBoundingClientRect();
    const right = pick("Statistik kamu");
    if (!left || !game || !right) return null;
    return {
      left: Math.round(left.width),
      game: Math.round(game.width),
      right: Math.round(right.width),
      ordered: left.right <= game.left + 1 && game.right <= right.left + 1,
    };
  });
  if (!geometry) throw new Error("salah satu kolom tidak ditemukan");
  if (!geometry.ordered) throw new Error("urutan kolom bukan kiri, tengah, kanan");
  return `kiri ${geometry.left}px, tengah ${geometry.game}px, kanan ${geometry.right}px`;
});

await check("filter di kolom kiri bekerja tanpa membuka apa pun", async () => {
  const panel = page.getByRole("complementary", { name: "Pengaturan" });
  const before = await panel.getByText(/lagu cocok sama filter ini/).innerText();
  await page.getByRole("button", { name: "Dangdut", exact: true }).click();
  const after = await panel.getByText(/lagu cocok sama filter ini/).innerText();
  if (before === after) throw new Error("jumlah tidak berubah");
  const dialogs = await page.getByRole("dialog").count();
  if (dialogs !== 0) throw new Error("ada panel yang terbuka, padahal tidak perlu");
  await page.getByRole("button", { name: "Semua genre", exact: true }).click();
  return `${before.trim()} -> ${after.trim()}, tanpa dialog`;
});

await check("statistik di kolom kanan ikut berubah setelah satu ronde", async () => {
  const stats = page.getByRole("complementary", { name: "Statistik kamu" });
  const before = await stats.innerText();
  await page.getByRole("button", { name: /Nyerah/ }).click();
  await page.getByRole("dialog").waitFor({ timeout: 5000 });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  const after = await stats.innerText();
  if (before === after) throw new Error("panel statistik tidak ikut berubah");
  if (!/Ronde dimainkan/.test(after)) throw new Error(`isi panel: ${after.slice(0, 60)}`);
  await page.getByRole("button", { name: "Putar lagi", exact: true }).click();
  await page.getByRole("button", { name: /Putar klip 0\.1s/ }).waitFor({ timeout: 25000 });
  return "angka di kolom kanan diperbarui tanpa perlu dibuka";
});

await check("panel kiri yang lebih tinggi dari layar tetap bisa dijangkau sampai bawah", async () => {
  // Sticky tanpa batas tinggi membuat bagian bawah panel tidak bisa dicapai
  // sama sekali, dan itu paling terlihat di layar pendek.
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  const panel = page.getByRole("complementary", { name: "Pengaturan" });
  await panel.waitFor({ timeout: 10000 });

  const scrollable = await panel.evaluate((node) => ({
    overflows: node.scrollHeight > node.clientHeight + 1,
    canScroll: getComputedStyle(node).overflowY === "auto",
  }));
  if (!scrollable.overflows) throw new Error("panel tidak lebih tinggi dari layar");
  if (!scrollable.canScroll) throw new Error("panel tidak bisa digulir di dalam dirinya");

  const reroll = page.getByRole("button", { name: /Acak ulang lagunya/ });
  await reroll.scrollIntoViewIfNeeded();
  if (!(await reroll.isVisible())) throw new Error("tombol paling bawah tetap tertutup");
  await reroll.click();
  await page.getByRole("button", { name: /Putar klip 0\.1s/ }).waitFor({ timeout: 25000 });
  return "panel menggulir di dalam dirinya, tombol paling bawah bisa ditekan";
});

await check("aturan scrollbar kustom benar-benar terkirim ke browser", async () => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto(BASE, { waitUntil: "networkidle" });

  // Berkas CSS yang benar-benar diunduh halaman ini dibaca apa adanya, bukan
  // lewat CSSOM: Chromium tidak selalu memaparkan aturan ::-webkit-scrollbar
  // di cssRules, jadi menelusuri CSSOM bisa melaporkan nol padahal aturannya
  // terkirim.
  const stylesheetText = await page.evaluate(async () => {
    const hrefs = [...document.querySelectorAll('link[rel="stylesheet"]')].map(
      (node) => node.href,
    );
    const inline = [...document.querySelectorAll("style")].map((node) => node.textContent);
    const fetched = await Promise.all(
      hrefs.map((href) => fetch(href).then((response) => response.text())),
    );
    return [...inline, ...fetched].join("\n");
  });

  const joined = stylesheetText;
  const required = [
    [".panel-scroll::-webkit-scrollbar", "aturan lebar panel"],
    ["width:6px", "lebar 6px di panel"],
    ["html::-webkit-scrollbar", "aturan scrollbar halaman"],
    ["width:10px", "lebar 10px di halaman"],
    ["--color-brand-deep", "warna merek saat diam"],
    ["thumb:hover", "aturan hover"],
  ];
  const missing = required
    .filter(([needle]) => !joined.includes(needle))
    .map(([, label]) => label);
  if (missing.length > 0) throw new Error(`tidak terkirim: ${missing.join(", ")}`);

  // Blok @supports harus benar-benar terpilih di mesin ini, kalau tidak yang
  // berlaku adalah jalur cadangan dan lebar 6px tidak pernah dipakai.
  const applied = await page.evaluate(() => {
    const panel = document.querySelector('[aria-label="Pengaturan"]');
    const style = getComputedStyle(panel);
    return {
      supportsSelector: CSS.supports("selector(::-webkit-scrollbar)"),
      scrollbarWidth: style.scrollbarWidth,
    };
  });
  if (!applied.supportsSelector) {
    throw new Error("mesin ini memakai jalur cadangan, bukan pseudo-element");
  }
  if (applied.scrollbarWidth !== "auto") {
    throw new Error(
      `scrollbar-width masih ${applied.scrollbarWidth}, jadi pseudo-element diabaikan`,
    );
  }
  return `aturan scrollbar kustom terkirim (${joined.length} byte CSS diperiksa), blok pseudo-element aktif`;
});

await check("scrollbar panel kiri: di tepi kiri dan tidak menimpa teks", async () => {
  const panel = page.getByRole("complementary", { name: "Pengaturan" });
  await panel.waitFor({ timeout: 10000 });

  const geometry = await panel.evaluate((node) => {
    const inner = node.firstElementChild;
    const panelBox = node.getBoundingClientRect();
    const heading = inner.querySelector("h2").getBoundingClientRect();
    const firstChip = inner.querySelector("button").getBoundingClientRect();
    return {
      dir: getComputedStyle(node).direction,
      innerDir: getComputedStyle(inner).direction,
      scrolls: node.scrollHeight > node.clientHeight + 1,
      // Nol di mesin ini: headless tidak merender scrollbar sama sekali, jadi
      // lebarnya tidak bisa diukur. Tetap diperiksa supaya kalau suatu saat
      // terukur, sisinya ikut diverifikasi.
      gutter: node.offsetWidth - node.clientWidth,
      clientLeft: node.clientLeft,
      headingFromEdge: Math.round(heading.left - panelBox.left),
      chipFromEdge: Math.round(firstChip.left - panelBox.left),
    };
  });

  if (geometry.dir !== "rtl") throw new Error(`arah wadah: ${geometry.dir}`);
  if (geometry.innerDir !== "ltr") {
    throw new Error(`arah isi ikut terbalik: ${geometry.innerDir}`);
  }
  if (!geometry.scrolls) throw new Error("panel ini bukan wadah yang menggulir");
  if (geometry.gutter > 0 && geometry.clientLeft !== geometry.gutter) {
    throw new Error(
      `scrollbar di sisi kanan: clientLeft ${geometry.clientLeft}px, lebar ${geometry.gutter}px`,
    );
  }
  // Padding harus lebih lebar dari scrollbar 6px, supaya teks tidak berada di
  // bawah jalurnya bahkan saat scrollbar digambar menimpa isi.
  for (const [label, value] of [
    ["judul", geometry.headingFromEdge],
    ["chip", geometry.chipFromEdge],
  ]) {
    if (value < 8) throw new Error(`${label} hanya ${value}px dari tepi, scrollbar 6px`);
    if (value > 20) throw new Error(`${label} ${value}px dari tepi, arah mungkin terbalik`);
  }

  const measured =
    geometry.gutter > 0
      ? `lebar terukur ${geometry.gutter}px di sisi kiri`
      : "lebar tidak terukur di browser ini (headless tidak merender scrollbar)";
  return `wadah rtl, isi ltr, judul dan chip ${geometry.headingFromEdge}px dari tepi; ${measured}`;
});

await check("teks di panel kiri tetap rata kiri setelah scrollbar dipindah", async () => {
  const alignment = await page.evaluate(() => {
    const panel = document.querySelector('[aria-label="Pengaturan"]');
    const heading = panel?.querySelector("h2");
    const firstChip = panel?.querySelector("button");
    if (!panel || !heading || !firstChip) return null;
    const box = panel.getBoundingClientRect();
    return {
      headingOffset: Math.round(heading.getBoundingClientRect().left - box.left),
      chipOffset: Math.round(firstChip.getBoundingClientRect().left - box.left),
    };
  });
  if (!alignment) throw new Error("panel atau isinya tidak ditemukan");
  // Keduanya harus menempel ke tepi kiri panel. Kalau arah ikut terbalik,
  // nilainya akan melompat jauh ke kanan.
  if (alignment.headingOffset > 20 || alignment.chipOffset > 20) {
    throw new Error(
      `judul +${alignment.headingOffset}px, chip +${alignment.chipOffset}px dari tepi kiri`,
    );
  }
  return `judul +${alignment.headingOffset}px, chip +${alignment.chipOffset}px dari tepi kiri`;
});

await check("di 1152px dan 1024px: satu kolom plus tombol Menu", async () => {
  // Diperiksa di dua lebar, termasuk 1152px yang persis di bawah ambang tiga
  // kolom: di situlah kesalahan ambang paling mudah lolos tanpa terlihat.
  for (const width of [1152, 1024]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Putar klip/ }).waitFor({ timeout: 25000 });
    await page.getByRole("button", { name: /Buka menu/ }).waitFor({ timeout: 5000 });

    const visible = await page.evaluate(() => {
      const labels = ["Pengaturan", "Statistik kamu"];
      return labels.filter((label) => {
        const node = document.querySelector(`[aria-label="${label}"]`);
        return node ? getComputedStyle(node).display !== "none" : false;
      });
    });
    if (visible.length > 0) {
      throw new Error(`${width}px: panel samping masih tampil: ${visible.join(", ")}`);
    }
  }
  return "1152px dan 1024px: panel samping display:none, tombol Menu kembali";
});

await check("layout Rapat di desktop tidak merender panel samping", async () => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Putar klip/ }).waitFor({ timeout: 25000 });
  await page.getByRole("button", { name: "Rapat", exact: true }).click();
  await page.waitForTimeout(400);

  const asides = await page.locator("aside").count();
  if (asides !== 0) throw new Error(`${asides} panel samping masih dirender`);
  await page.getByRole("button", { name: /Buka menu/ }).waitFor({ timeout: 5000 });

  await page.getByRole("button", { name: /Buka menu/ }).click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "Lebar", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("complementary", { name: "Pengaturan" }).waitFor({ timeout: 5000 });
  return "nol panel samping di Rapat, Menu mengapung tetap ada";
});

// ------------------------------------------------------- halaman konten

await check("accordion pertanyaan singkat bisa dibuka dengan keyboard", async () => {
  await page.locator("#tanya summary").first().focus();
  await page.keyboard.press("Enter");
  const open = await page.locator("#tanya details").first().evaluate((node) => node.open);
  if (!open) throw new Error("accordion tidak terbuka");
  return "terbuka";
});

for (const [path, marker] of [
  ["/faq", "Pertanyaan soal TebakLagu"],
  ["/privasi", "Kebijakan Privasi"],
  ["/ketentuan", "Syarat dan Ketentuan"],
  ["/genre", "Pilih genre"],
]) {
  await check(`navigasi ke ${path} punya tujuan nyata`, async () => {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { level: 1, name: marker }).waitFor({ timeout: 10000 });
    return marker;
  });
}

await check("tautan genre memuat game dengan filter genre terpasang", async () => {
  await page.goto(`${BASE}/genre`, { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: /Dangdut/ }).click();
  await page.getByRole("heading", { level: 1, name: "Dangdut" }).waitFor({ timeout: 10000 });
  await page.getByRole("button", { name: /Putar klip 0\.1s/ }).waitFor({ timeout: 25000 });
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("tebaklagu.settings.v1") ?? "{}"),
  );
  if (saved.filters?.genre !== "dangdut") throw new Error(`genre=${saved.filters?.genre}`);
  return "filter genre=dangdut terpasang";
});

await check("rute yang tidak ada memberi 404, bukan halaman kosong", async () => {
  expecting404 = true;
  const response = await page.goto(`${BASE}/rute-yang-tidak-ada`, {
    waitUntil: "domcontentloaded",
  });
  if (response?.status() !== 404) throw new Error(`status=${response?.status()}`);
  await page.getByRole("heading", { level: 1 }).waitFor();
  const text = await page.evaluate(() => document.body.innerText);
  if (!/Balik ke game/.test(text)) throw new Error("tidak ada jalan kembali");
  expecting404 = false;
  return "404 dengan penjelasan dan tautan kembali";
});

// ------------------------------------------------- responsif dan luapan

for (const width of [320, 375, 480, 768, 1024, 1152, 1280, 1440]) {
  await check(`nol luapan horizontal di ${width}px`, async () => {
    await page.setViewportSize({ width, height: 800 });
    const offenders = [];
    for (const path of ["/", "/faq", "/privasi", "/ketentuan", "/genre"]) {
      await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(250);
      const overflow = await page.evaluate(() => {
        const root = document.documentElement;
        return root.scrollWidth - root.clientWidth;
      });
      if (overflow > 0) offenders.push(`${path}:+${overflow}px`);
    }
    if (offenders.length > 0) throw new Error(offenders.join(", "));
    return "5 halaman, scrollWidth == clientWidth";
  });
}

await check("target sentuh minimal 44px di 320px", async () => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Putar klip/ }).waitFor({ timeout: 25000 });
  const small = await page.evaluate(() => {
    const out = [];
    for (const node of document.querySelectorAll("button, a[href], input, summary")) {
      const box = node.getBoundingClientRect();
      if (box.width === 0 && box.height === 0) continue;
      // Skip link sengaja 1x1 selama tidak difokus: ukurannya diperiksa
      // terpisah di pemeriksaan skip link, saat ia terlihat.
      if (box.width <= 1 && box.height <= 1) continue;
      if (box.height < 44 || box.width < 24) {
        out.push(
          `${node.tagName}:${(node.textContent ?? "").trim().slice(0, 18)}=${Math.round(box.width)}x${Math.round(box.height)}`,
        );
      }
    }
    return out;
  });
  if (small.length > 0) throw new Error(small.join(", "));
  return "semua kontrol >= 44px tinggi";
});

await check("menu di layar sempit terbuka sebagai sheet dari bawah", async () => {
  await page.getByRole("button", { name: /Buka menu/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ timeout: 5000 });
  const geometry = await dialog.evaluate((node) => {
    const box = node.getBoundingClientRect();
    return { bottom: Math.round(box.bottom), width: Math.round(box.width) };
  });
  if (geometry.width < 300) throw new Error(`lebar sheet ${geometry.width}px`);
  await page.keyboard.press("Escape");
  return `menempel ke bawah, lebar ${geometry.width}px`;
});

// -------------------------------------------------- teks dan pola slop

await check("tidak ada em dash atau emoji di teks yang dirender", async () => {
  const offenders = [];
  for (const path of ["/", "/faq", "/privasi", "/ketentuan", "/genre"]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    const text = await page.evaluate(() => document.body.innerText);
    if (text.includes("\u2014")) offenders.push(`${path}: em dash`);
    if (/\p{Extended_Pictographic}/u.test(text)) offenders.push(`${path}: emoji`);
  }
  if (offenders.length > 0) throw new Error(offenders.join(", "));
  return "5 halaman bersih";
});

await check("tidak ada CTA generik maupun buzzword", async () => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  const text = await page.evaluate(() => document.body.innerText);
  const banned = [
    "Get Started",
    "Learn More",
    "Try Now",
    "Explore",
    "AI Powered",
    "Seamless",
    "Revolutionary",
    "Cutting Edge",
  ].filter((word) => text.includes(word));
  if (banned.length > 0) throw new Error(banned.join(", "));
  return "tidak ada";
});

await check("dosis efek: blur hanya pada overlay drawer", async () => {
  await page.setViewportSize({ width: 1024, height: 860 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  const idle = await page.evaluate(
    () =>
      [...document.querySelectorAll("*")].filter((node) => {
        const filter = getComputedStyle(node).backdropFilter;
        return filter && filter !== "none";
      }).length,
  );
  await page.getByRole("button", { name: /Buka menu/ }).click();
  await page.getByRole("dialog").waitFor();
  const open = await page.evaluate(
    () =>
      [...document.querySelectorAll("*")].filter((node) => {
        const filter = getComputedStyle(node).backdropFilter;
        return filter && filter !== "none";
      }).length,
  );
  await page.keyboard.press("Escape");
  if (idle !== 0 || open !== 1) throw new Error(`diam=${idle}, drawer terbuka=${open}`);
  return "0 saat diam, 1 saat drawer terbuka";
});

await check("dosis efek: shadow hanya pada panel yang melayang", async () => {
  const count = await page.evaluate(
    () =>
      [...document.querySelectorAll("*")].filter((node) => {
        const shadow = getComputedStyle(node).boxShadow;
        return shadow && shadow !== "none";
      }).length,
  );
  if (count > 2) throw new Error(`${count} elemen punya shadow saat tidak ada panel`);
  return `${count} elemen`;
});

await check("tidak ada animasi yang berjalan tanpa pemicu", async () => {
  await page.waitForTimeout(1200);
  const looping = await page.evaluate(
    () =>
      document.getAnimations().filter((animation) => {
        const effect = animation.effect;
        const timing = effect?.getTiming();
        return (
          animation.playState === "running" &&
          (timing?.iterations === Infinity || (timing?.iterations ?? 1) > 1)
        );
      }).length,
  );
  if (looping > 0) throw new Error(`${looping} animasi berulang tanpa henti`);
  return "0 animasi berulang";
});

// ------------------------------------- keadaan kosong dan error sisanya
// Diletakkan paling akhir dengan halaman sendiri: mematikan jaringan dan
// memalsukan 502 akan mencemari pemeriksaan lain kalau dijalankan di tengah.

const edge = await context.newPage();
await edge.setViewportSize({ width: 1024, height: 860 });

await check("keadaan kosong autocomplete menyebut penyebab dan tindakan", async () => {
  await edge.goto(BASE, { waitUntil: "networkidle" });
  const input = edge.getByRole("combobox");
  await input.waitFor({ timeout: 25000 });
  await input.fill("zzqqxx");
  await edge.getByText("Nggak ketemu judul itu di katalog kami.").waitFor({ timeout: 5000 });
  await edge.getByText("Coba potongan judulnya aja.").waitFor();
  await input.fill("");
  return "pesan plus saran tindakan terlihat";
});

await check("keadaan error: layanan tidak menjawab memberi penyebab dan Coba lagi yang memulihkan", async () => {
  // Kegagalan dipalsukan di lapisan jaringan, bukan di kode aplikasi, supaya
  // yang diuji benar-benar jalur error yang akan dipakai di produksi.
  await edge.route("**/api/song/**", (route) =>
    route.fulfill({ status: 502, body: '{"error":"upstream-failed"}' }),
  );
  await edge.getByRole("button", { name: /Buka menu/ }).click();
  await edge.getByRole("dialog").waitFor();
  await edge.getByRole("button", { name: /Acak ulang lagunya/ }).click();

  const alert = edge.getByRole("alert").first();
  await alert.waitFor({ timeout: 20000 });
  const text = await alert.innerText();
  if (!/Gagal ngambil klip lagunya/.test(text)) throw new Error(`pesan: ${text}`);
  if (!/Layanan previewnya nggak jawab/.test(text)) throw new Error("tanpa penyebab");

  await edge.unroute("**/api/song/**");
  await alert.getByRole("button", { name: /Coba lagi/ }).click();
  await edge.getByRole("button", { name: /Putar klip 0\.1s/ }).waitFor({ timeout: 25000 });
  return "pesan plus penyebab plus Coba lagi yang benar-benar memulihkan";
});

await check("keadaan offline punya pesannya sendiri, bukan pesan gagal yang sama", async () => {
  try {
    await context.setOffline(true);
    await edge.getByRole("button", { name: /Buka menu/ }).click();
    await edge.getByRole("dialog").waitFor();
    await edge.getByRole("button", { name: /Acak ulang lagunya/ }).click();
    await edge.waitForTimeout(1500);

    // Metadata lagu boleh disinggahi cache HTTP, jadi reroll saat offline bisa
    // berhasil. Yang pasti butuh jaringan adalah pengambilan klipnya, dan di
    // situlah keadaan offline harus muncul.
    const play = edge.getByRole("button", { name: /Putar klip/ });
    if (await play.isEnabled()) await play.click();

    // Ditunggu per teks, bukan lewat innerText satu wadah: wadahnya dirender
    // ulang saat drawer menutup, dan membaca isinya bisa kena node yang sudah
    // lepas dari dokumen.
    await edge
      .getByText("Kamu lagi offline. Game butuh koneksi buat ngambil klipnya.")
      .waitFor({ timeout: 20000 });
    await edge
      .getByText("Statistik disimpan lokal, jadi masih bisa kamu buka dari menu.")
      .waitFor({ timeout: 5000 });
    return "pesan offline plus tindakan alternatif terlihat";
  } finally {
    // Dipulihkan apa pun hasilnya: kalau tidak, pemeriksaan lain ikut gagal
    // karena jaringan masih mati, dan laporannya jadi menyesatkan.
    await context.setOffline(false);
  }
});

await edge.close();

// ------------------------------------------------------------------ hasil

await browser.close();

const failed = results.filter((item) => !item.ok);
console.log(`\n${results.length - failed.length}/${results.length} pemeriksaan lewat.`);

if (consoleErrors.length > 0) {
  console.log(`\nError konsol (${consoleErrors.length}):`);
  for (const error of consoleErrors.slice(0, 10)) console.log(`  ${error}`);
} else {
  console.log("Tidak ada error konsol.");
}

if (failed.length > 0 || consoleErrors.length > 0) process.exit(1);
