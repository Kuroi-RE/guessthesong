"use client";

import { useTranslation } from "react-i18next";
import { IconPlay, IconStop } from "./icons";

export type PlayState = "idle" | "loading" | "playing" | "unavailable";

interface PlayButtonProps {
  state: PlayState;
  durationLabel: string;
  /** Denyut sekali saat kunjungan pertama, lalu tidak pernah lagi. */
  hint: boolean;
  onPress: () => void;
}

/**
 * Satu-satunya elemen bulat dan satu-satunya yang punya glow di seluruh produk.
 * Bentuk dan efeknya yang menjadikannya titik fokus, tanpa perlu warna atau
 * ukuran tambahan (design.md 8.1 dan 2.3).
 *
 * Ukurannya 88px, turun ke 72px di layar paling sempit: tetap jauh di atas
 * minimum 44px, tapi tidak lagi mendominasi layar sempit (design.md 7.2).
 */
export function PlayButton({
  state,
  durationLabel,
  hint,
  onPress,
}: PlayButtonProps) {
  const { t } = useTranslation();
  const playing = state === "playing";

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={state === "loading" || state === "unavailable"}
      aria-label={
        playing ? t("game.stopClip") : t("game.playClip", { duration: durationLabel })
      }
      className={`on-brand grid size-18 place-items-center rounded-full border-2 border-brand-deep bg-brand text-on-brand transition-shadow duration-150 disabled:cursor-not-allowed disabled:opacity-60 sm:size-22 ${
        playing ? "glow-brand" : ""
      } ${hint ? "animate-[play-hint_600ms_ease-out_1]" : ""}`}
    >
      {state === "loading" ? (
        <span
          className="block size-6 animate-spin rounded-full border-2 border-on-brand border-t-transparent"
          aria-hidden="true"
        />
      ) : playing ? (
        <IconStop className="size-8" />
      ) : (
        <IconPlay className="size-8" />
      )}
    </button>
  );
}
