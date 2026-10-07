"use client";

import { useTranslation } from "react-i18next";
import { CLIP_STEPS, formatClip, ladderWeights } from "@/lib/game";

type SegmentState = "passed" | "active" | "next" | "locked";

function stateOf(index: number, currentStep: number): SegmentState {
  if (index < currentStep) return "passed";
  if (index === currentStep) return "active";
  if (index === currentStep + 1) return "next";
  return "locked";
}

/**
 * Pembeda antar keadaan adalah tingkat isian, bukan rona border.
 *
 * Dua border dengan rona berbeda tidak bisa dibuat lewat 3:1 satu sama lain di
 * tema terang tanpa membuat salah satunya hampir hitam. Isian penuh melawan
 * isian bertitik melawan kosong adalah pembedaan yang lebih kuat, dan tiap
 * border tetap diukur terhadap latar, bukan terhadap border sebelahnya.
 */
const SEGMENT_CLASS: Record<SegmentState, string> = {
  passed: "bg-ladder-fill border-ladder-fill",
  active: "border-ladder-fill bg-transparent",
  next: "border-ladder-fill bg-ladder-fill/25",
  locked: "border-ladder-idle bg-transparent",
};

interface ClueLadderProps {
  currentStep: number;
  playing: boolean;
  /** Durasi klip yang sedang berbunyi, untuk mengatur laju playhead. */
  playingSeconds: number;
  showLabels: boolean;
}

/**
 * Motif identitas produk (design.md Bagian 3). Lebar segmen tidak sama:
 * ketidaksamaannya adalah isi informasinya, bukan variasi gaya.
 *
 * Segmen tidak interaktif, jadi ia tidak terkena aturan target sentuh 44px.
 * Nilainya dibacakan pembaca layar lewat aria-label pada grupnya, dan
 * segmennya sendiri aria-hidden karena bentuknya representasi dari label itu.
 */
export function ClueLadder({
  currentStep,
  playing,
  playingSeconds,
  showLabels,
}: ClueLadderProps) {
  const { t } = useTranslation();
  const weights = ladderWeights();

  return (
    <div
      role="group"
      aria-label={t("game.ladderLabel", {
        duration: formatClip(CLIP_STEPS[currentStep] ?? CLIP_STEPS[0]),
        step: currentStep + 1,
        total: CLIP_STEPS.length,
      })}
      className="w-full"
    >
      <div className="flex w-full items-end gap-1" aria-hidden="true">
        {CLIP_STEPS.map((seconds, index) => {
          const state = stateOf(index, currentStep);
          return (
            <div
              key={seconds}
              style={{ flexGrow: weights[index] }}
              className="flex min-w-0 flex-col gap-1.5"
            >
              <div
                className={`relative h-3 overflow-hidden rounded-sharp border ${SEGMENT_CLASS[state]}`}
              >
                {state === "active" && playing ? (
                  <span
                    data-motion="data"
                    className="playhead-fill absolute inset-y-0 left-0 animate-[playhead_linear_forwards]"
                    style={{ animationDuration: `${playingSeconds}s` }}
                  />
                ) : null}
              </div>
              {showLabels ? (
                <span className="tnum truncate text-center text-[0.625rem] text-muted">
                  {formatClip(seconds)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface MiniLadderProps {
  step: number;
  label: string;
}

/**
 * Tangga yang sama dalam ukuran baris riwayat. Ia penanda status di baris itu,
 * jadi stripe berwarna di tepi kiri tidak dibutuhkan (design.md 8.3).
 */
export function MiniLadder({ step, label }: MiniLadderProps) {
  const weights = ladderWeights();
  return (
    <span className="flex w-10 shrink-0 items-end gap-px" title={label}>
      {CLIP_STEPS.map((seconds, index) => (
        <span
          key={seconds}
          style={{ flexGrow: weights[index] }}
          className={`h-4 rounded-sharp ${
            index === step
              ? "bg-ladder-fill"
              : index < step
                ? "bg-ladder-fill/50"
                : "bg-ladder-idle"
          }`}
        />
      ))}
    </span>
  );
}
