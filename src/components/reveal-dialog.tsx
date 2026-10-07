"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "./overlay";
import { Button } from "./ui";
import { ClueLadder } from "./clue-ladder";
import type { CatalogSong } from "@/lib/catalog-types";
import {
  CLIP_STEPS,
  buildShareText,
  formatClip,
  type AttemptRecord,
  type RoundStatus,
} from "@/lib/game";

interface RevealDialogProps {
  open: boolean;
  song: CatalogSong;
  artworkUrl: string | null;
  status: Exclude<RoundStatus, "playing">;
  attempts: readonly AttemptRecord[];
  gaveUp: boolean;
  streak: number;
  onClose: () => void;
  onPlayAgain: () => void;
}

export function RevealDialog({
  open,
  song,
  artworkUrl,
  status,
  attempts,
  gaveUp,
  streak,
  onClose,
  onPlayAgain,
}: RevealDialogProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const [shareNote, setShareNote] = useState<string | null>(null);

  const won = status === "won";
  const winningStep = attempts.find((a) => a.outcome === "correct")?.step ?? null;
  const lastStep = Math.max(0, ...attempts.map((a) => a.step));

  const heading = won
    ? t("game.correct")
    : gaveUp
      ? t("game.gaveUp")
      : t("game.outOfAttempts");

  async function share() {
    const text = buildShareText({
      attempts,
      status,
      productName: t("brand.name"),
      dateLabel: new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "2-digit",
      }).format(new Date()),
      resultLine:
        won && winningStep !== null
          ? t("game.revealWin", {
              duration: formatClip(CLIP_STEPS[winningStep] ?? CLIP_STEPS[0]),
            })
          : t("game.revealLose"),
      siteLabel: typeof window === "undefined" ? "" : window.location.host,
    });

    try {
      await navigator.clipboard.writeText(text);
      setShareNote(t("common.shareCopied"));
    } catch {
      setShareNote(t("common.shareFailed"));
    }
  }

  return (
    <Dialog open={open} onClose={onClose} labelledBy={titleId}>
      <p className="text-meta text-muted">{heading}</p>

      <div className="mt-3 flex items-start gap-3">
        {artworkUrl ? (
          <span className="size-24 shrink-0 overflow-hidden rounded-panel border border-line">
            <Image
              src={artworkUrl}
              alt={t("game.coverAlt", { title: song.title, artist: song.artist })}
              width={96}
              height={96}
              className="size-full object-cover"
              unoptimized
            />
          </span>
        ) : null}

        <div className="min-w-0">
          {/* Fokus pertama jatuh ke judul, bukan ke tombol, supaya pembaca layar
              membacakan jawabannya lebih dulu (design.md 8.4). */}
          <h2
            id={titleId}
            tabIndex={-1}
            data-autofocus
            className="text-h2 break-words"
          >
            {song.title}
          </h2>
          <p className="text-meta text-muted">
            {song.artist} ({song.year})
          </p>
        </div>
      </div>

      <div className="mt-4">
        <ClueLadder
          currentStep={won && winningStep !== null ? winningStep : lastStep}
          playing={false}
          playingSeconds={0}
          showLabels
        />
      </div>

      <dl className="mt-4 flex items-baseline gap-2 border-t border-line pt-3">
        <dt className="text-meta text-muted">{t("stats.streak")}</dt>
        <dd className={`tnum text-h2 ${won ? "text-correct" : "text-text"}`}>
          {streak}
        </dd>
      </dl>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button variant="primary" onClick={onPlayAgain} className="flex-1">
          {t("common.replay")}
        </Button>
        <Button variant="secondary" onClick={share} className="flex-1">
          {t("common.share")}
        </Button>
      </div>

      <p role="status" className="mt-2 min-h-5 text-meta text-muted">
        {shareNote}
      </p>

      {/* Atribusi muncul di sini karena di sinilah metadata lagu ditampilkan. */}
      <p className="mt-2 border-t border-line pt-3 text-meta text-muted">
        {t("game.attribution")}
      </p>

      <div className="mt-3 flex justify-end">
        <Button variant="quiet" onClick={onClose}>
          {t("common.close")}
        </Button>
      </div>
    </Dialog>
  );
}
