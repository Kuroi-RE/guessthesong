"use client";

import { useTranslation } from "react-i18next";
import { MiniLadder } from "./clue-ladder";
import { IconCorrect, IconWrong } from "./icons";
import { formatClip, CLIP_STEPS, type AttemptRecord } from "@/lib/game";

/**
 * Baris, bukan kartu: riwayat adalah urutan yang dibaca dari atas ke bawah,
 * dan baris penuh lebar lebih cepat dipindai daripada grid kartu (design.md 8.3).
 *
 * Warna pada baris benar hanya di border dan label, tidak membanjiri isi baris,
 * supaya judulnya tetap yang terbaca pertama.
 */
export function AttemptRow({
  attempt,
  isNewest,
}: {
  attempt: AttemptRecord;
  isNewest: boolean;
}) {
  const { t } = useTranslation();
  const correct = attempt.outcome === "correct";
  const skipped = attempt.outcome === "skipped";

  const statusLabel = correct
    ? t("game.statusCorrect")
    : skipped
      ? t("game.statusSkipped")
      : t("game.statusWrong");

  return (
    <li
      // Hanya baris baru yang bergerak, baris lama diam (design.md Bagian 10).
      className={`flex min-h-14 items-center gap-3 rounded-panel border bg-surface px-3 py-2 ${
        correct ? "border-correct" : "border-line"
      } ${isNewest ? "animate-[row-enter_160ms_ease-out_1]" : ""}`}
    >
      <MiniLadder
        step={attempt.step}
        label={t("game.ladderSegment", {
          duration: formatClip(CLIP_STEPS[attempt.step] ?? CLIP_STEPS[0]),
        })}
      />

      {/* Baris skip dibiarkan kosong di sini: tidak ada tebakan yang dibuat,
          dan statusnya sudah dinyatakan di kanan. Menuliskan "Dilewatin" di
          kedua sisi hanya mengulang satu fakta dua kali (design.md 8.3). */}
      <span className="min-w-0 flex-1 truncate text-ui" title={attempt.guessTitle}>
        {attempt.guessTitle}
      </span>

      {/* Skip bukan tebakan salah, jadi ia tidak memakai warna semantik salah
          maupun ikonnya: --bata-400 dikunci ke state salah dan error saja
          (design.md 2.1). */}
      <span
        className={`flex shrink-0 items-center gap-1.5 text-meta ${
          correct ? "text-correct" : skipped ? "text-muted" : "text-wrong"
        }`}
      >
        {correct ? (
          <IconCorrect className="size-4" />
        ) : skipped ? null : (
          <IconWrong className="size-3.5" />
        )}
        {statusLabel}
      </span>
    </li>
  );
}
