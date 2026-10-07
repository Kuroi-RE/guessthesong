"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/app/providers";
import { AudioError, ClipPlayer, type AudioFailure } from "@/lib/audio-engine";
import { filterCatalog, pickSong } from "@/lib/catalog";
import type { CatalogSong } from "@/lib/catalog-types";
import {
  CLIP_STEPS,
  LADDER_SIZE,
  MAX_ATTEMPTS,
  clipSeconds,
  formatClip,
  type AttemptRecord,
  type RoundStatus,
} from "@/lib/game";
import { EMPTY_STATS, readStats, recordRound, type Stats } from "@/lib/stats";
import { useGameBridge } from "@/app/game-bridge";
import { AttemptRow } from "./attempt-row";
import { ClueLadder } from "./clue-ladder";
import { GuessInput } from "./guess-input";
import { IconSkip } from "./icons";
import { PlayButton, type PlayState } from "./play-button";
import { RevealDialog } from "./reveal-dialog";
import { SettingsPanel } from "./settings-panel";
import { StatsPanel } from "./stats-panel";
import { Button } from "./ui";

interface Loaded {
  song: CatalogSong;
  clipUrl: string;
  artworkUrl: string | null;
}

type Phase = "idle" | "resolving" | "ready" | "empty" | "failed";

export function Game() {
  const { t } = useTranslation();
  const { settings, ready, markOnboardingSeen } = useSettings();

  const player = useRef<ClipPlayer>(undefined);
  const recent = useRef<string[]>([]);
  const consecutiveFailures = useRef(0);
  /**
   * Penanda ronde. Mengubah filter dua kali berturut-turut memulai dua
   * penyelesaian lagu, dan yang pertama bisa selesai belakangan lalu menimpa
   * hasil yang benar. Setiap hasil yang datang dari ronde yang bukan ronde
   * terakhir dibuang di sini.
   */
  const roundToken = useRef(0);

  const [phase, setPhase] = useState<Phase>("idle");
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [step, setStep] = useState(0);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [status, setStatus] = useState<RoundStatus>("playing");
  const [gaveUp, setGaveUp] = useState(false);
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState<AudioFailure | "upstream" | null>(null);
  const [swappedFrom, setSwappedFrom] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [revealOpen, setRevealOpen] = useState(false);
  const { registerReroll } = useGameBridge();

  useEffect(() => {
    player.current = new ClipPlayer();
    setStats(readStats());
    return () => player.current?.reset();
  }, []);

  useEffect(() => {
    player.current?.setVolume(settings.volume);
  }, [settings.volume]);

  const startRound = useCallback(
    async (swapNoteFor?: string) => {
      const token = roundToken.current + 1;
      roundToken.current = token;

      player.current?.reset();
      setStep(0);
      setAttempts([]);
      setStatus("playing");
      setGaveUp(false);
      setRevealOpen(false);
      setPlayState("idle");
      setFailure(null);
      setMessage("");
      setSwappedFrom(swapNoteFor ?? null);

      const next = pickSong(settings.filters, recent.current);
      if (!next) {
        setLoaded(null);
        setPhase("empty");
        return;
      }

      setPhase("resolving");
      setLoaded(null);

      try {
        const response = await fetch(`/api/song/${next.id}`);
        if (token !== roundToken.current) return;
        if (!response.ok) throw new Error("resolve-failed");

        const payload = (await response.json()) as {
          playable: boolean;
          clipUrl?: string;
          artworkUrl?: string | null;
        };
        if (token !== roundToken.current) return;

        if (!payload.playable || !payload.clipUrl) {
          // Lagu ini tidak punya preview resmi. Diganti sekali, dan pemain
          // diberi tahu bahwa lagunya diganti (design.md 9.3).
          recent.current = [next.id, ...recent.current].slice(0, 30);
          consecutiveFailures.current += 1;
          if (consecutiveFailures.current <= 2) {
            void startRound(next.title);
            return;
          }
          setFailure("no-preview");
          setPhase("failed");
          return;
        }

        consecutiveFailures.current = 0;
        recent.current = [next.id, ...recent.current].slice(0, 30);
        setLoaded({
          song: next,
          clipUrl: payload.clipUrl,
          artworkUrl: payload.artworkUrl ?? null,
        });
        setPhase("ready");
      } catch {
        if (token !== roundToken.current) return;
        consecutiveFailures.current += 1;
        // Offline dan "layanan tidak menjawab" punya tindakan pemulihan yang
        // berbeda, jadi keduanya tidak boleh berbagi satu pesan (design.md 9.3).
        const offline =
          typeof navigator !== "undefined" && navigator.onLine === false;
        setFailure(offline ? "offline" : "upstream");
        setPhase("failed");
      }
    },
    [settings.filters],
  );

  // Ronde pertama baru dimulai setelah pengaturan dibaca, supaya filter yang
  // tersimpan tidak ditimpa oleh ronde yang dimulai dengan nilai default.
  useEffect(() => {
    if (!ready) return;
    void startRound();
  }, [ready, startRound]);

  const stopClip = useCallback(() => {
    player.current?.stop();
    setPlayState("idle");
  }, []);

  const press = useCallback(async () => {
    if (!loaded || status !== "playing") return;
    const engine = player.current;
    if (!engine) return;

    if (playState === "playing") {
      stopClip();
      return;
    }

    setFailure(null);
    setPlayState("loading");

    try {
      await engine.unlock();
      await engine.load(
        loaded.song.id,
        loaded.clipUrl,
        settings.startFrom,
        CLIP_STEPS[LADDER_SIZE - 1] ?? 15,
      );

      const seconds = clipSeconds(step);
      setPlayState("playing");
      engine.play(seconds, () => setPlayState("idle"));

      if (!settings.seenOnboarding) markOnboardingSeen();
    } catch (error) {
      setPlayState("idle");
      setFailure(error instanceof AudioError ? error.kind : "fetch");
    }
  }, [
    loaded,
    status,
    playState,
    step,
    settings.startFrom,
    settings.seenOnboarding,
    markOnboardingSeen,
    stopClip,
  ]);

  const finishRound = useCallback(
    (outcome: Exclude<RoundStatus, "playing">, winningStep: number | null) => {
      stopClip();
      setStatus(outcome);
      setStats((current) => recordRound(current, outcome, winningStep));
      setRevealOpen(true);
    },
    [stopClip],
  );

  const advance = useCallback(
    (record: AttemptRecord) => {
      const nextAttempts = [...attempts, record];
      setAttempts(nextAttempts);

      if (nextAttempts.length >= MAX_ATTEMPTS) {
        finishRound("lost", null);
        return;
      }

      const nextStep = Math.min(step + 1, LADDER_SIZE - 1);
      setStep(nextStep);
      stopClip();

      const duration = formatClip(clipSeconds(nextStep));
      setMessage(
        record.outcome === "skipped"
          ? t("game.skippedWithNext", { duration })
          : t("game.wrongWithNext", { duration }),
      );
    },
    [attempts, step, finishRound, stopClip, t],
  );

  const guess = useCallback(
    (chosen: CatalogSong) => {
      if (!loaded || status !== "playing") return;
      if (chosen.id === loaded.song.id) {
        setAttempts((current) => [
          ...current,
          { outcome: "correct", guessTitle: chosen.title, step },
        ]);
        setMessage(t("game.correct"));
        finishRound("won", step);
        return;
      }
      advance({ outcome: "wrong", guessTitle: chosen.title, step });
    },
    [loaded, status, step, advance, finishRound, t],
  );

  // Shortcut P didaftarkan di FAQ supaya bukan rahasia (design.md 11.1).
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "p" || event.metaKey || event.ctrlKey) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      // Selagi dialog atau drawer terbuka, P milik panel itu, bukan milik game.
      if (document.querySelector('[role="dialog"]')) return;
      event.preventDefault();
      void press();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  // Layar game mendaftarkan "acak ulang" supaya tombolnya di drawer punya
  // tindakan nyata, dan tidak dirender sama sekali di halaman konten.
  useEffect(() => {
    registerReroll(() => void startRound());
    return () => registerReroll(null);
  }, [registerReroll, startRound]);

  const tight = settings.layout === "tight";
  const pool = filterCatalog(settings.filters);
  const attemptsLeft = MAX_ATTEMPTS - attempts.length;
  const visibleAttempts = tight ? attempts.slice(-3) : attempts;
  const hiddenAttempts = attempts.length - visibleAttempts.length;

  const durationLabel = formatClip(clipSeconds(step));

  const resolvedPlayState: PlayState =
    phase === "resolving"
      ? "loading"
      : phase !== "ready" || status !== "playing"
        ? "unavailable"
        : playState;

  return (
    <>
      {/* Tiga kolom di XXL: pengaturan, game, statistik. Di bawah 1280px kedua
          panel samping display:none, jadi kontrolnya tidak ikut urutan Tab dan
          tidak jadi duplikat dari drawer (design.md 6.6). */}
      <div
        className={
          tight
            ? "mx-auto w-full max-w-[420px]"
            : "mx-auto grid w-full max-w-[420px] gap-8 md:max-w-[520px] xl:max-w-[1168px] xl:grid-cols-[300px_520px_300px] xl:items-start xl:gap-6"
        }
      >
        {!tight ? (
          /*
           * dir="rtl" pada wadah yang menggulir memindahkan scrollbar ke tepi
           * kiri, dan dir="ltr" di dalamnya mengembalikan arah untuk semua isi.
           *
           * Alasannya posisi, bukan selera: di tepi kanan, scrollbar panel ini
           * berdiri tepat di antara kolom pengaturan dan kolom game, jadi ia
           * menambah satu garis vertikal di celah yang justru tugasnya
           * memisahkan dua kolom. Dipindah ke kiri, ia menempel ke tepi luar
           * halaman, tempat scrollbar memang biasa berada.
           */
          <aside
            dir="rtl"
            aria-label={t("settings.title")}
            className="panel-scroll hidden min-w-0 xl:sticky xl:top-20 xl:block xl:max-h-[calc(100dvh-6rem)] xl:overflow-y-auto"
          >
            <div dir="ltr" className="pl-2.5">
              <h2 className="mb-4 border-b border-line pb-2 text-ui font-semibold">
                {t("settings.title")}
              </h2>
              <SettingsPanel
                variant="inline"
                stats={stats}
                onReroll={() => void startRound()}
              />
            </div>
          </aside>
        ) : null}

        <section
          id="game"
          aria-label={t("game.title")}
          className="w-full min-w-0"
        >
          <div
            className={`flex flex-col items-center ${tight ? "gap-4" : "gap-4 sm:gap-6"}`}
          >
          <p className="tnum text-clip font-semibold text-brand-text" aria-hidden="true">
            {durationLabel}
          </p>

          <PlayButton
            state={resolvedPlayState}
            durationLabel={durationLabel}
            hint={ready && !settings.seenOnboarding && phase === "ready"}
            onPress={() => void press()}
          />

          <div className="w-full">
            <ClueLadder
              currentStep={step}
              playing={playState === "playing"}
              playingSeconds={clipSeconds(step)}
              showLabels={!tight}
            />
          </div>

          {status === "playing" ? (
            <div className="flex w-full gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                disabled={phase !== "ready"}
                onClick={() =>
                  advance({ outcome: "skipped", guessTitle: "", step })
                }
              >
                <IconSkip className="size-4" />
                {t("common.skip")}
              </Button>
              <Button
                variant="quiet"
                className="flex-1"
                disabled={phase !== "ready"}
                onClick={() => {
                  setGaveUp(true);
                  finishRound("lost", null);
                }}
              >
                {t("common.giveUp")}
              </Button>
            </div>
          ) : (
            // Ronde sudah selesai. Kalau pemain menutup panel reveal, dia harus
            // tetap punya jalan ke ronde berikutnya yang terlihat di layar,
            // bukan hanya lewat menu: tanpa ini layar jadi jalan buntu.
            <div className="flex w-full gap-3">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => void startRound()}
              >
                {t("common.replay")}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setRevealOpen(true)}
              >
                {t("game.revealTitle")}
              </Button>
            </div>
          )}

          {/* Satu-satunya onboarding, dan ia memberi tindakan nyata (design.md 9.1). */}
          {!settings.seenOnboarding && phase === "ready" && attempts.length === 0 ? (
            <p className="text-center text-meta text-muted">{t("game.onboarding")}</p>
          ) : null}

          <GameStatus
            phase={phase}
            failure={failure}
            swappedFrom={swappedFrom}
            attemptsLeft={attemptsLeft}
            message={message}
            status={status}
            onRetry={() => void startRound()}
          />

          {phase === "ready" && status === "playing" ? (
            <div className="w-full">
              <GuessInput
                pool={pool}
                disabled={status !== "playing"}
                autoFocusOnDesktop={attempts.length === 0}
                onGuess={guess}
              />
            </div>
          ) : null}

          {/* Riwayat tidak dirender saat kosong: wadah kosong hanya menambah
              tinggi halaman di babak pertama (design.md 6.4). */}
          {attempts.length > 0 ? (
            <div className="w-full">
              <h2 className="mb-2 text-meta text-muted">{t("game.historyTitle")}</h2>
              <ul className="flex flex-col gap-2">
                {visibleAttempts.map((attempt, index) => (
                  <AttemptRow
                    key={`${attempt.step}-${index}-${attempt.guessTitle}`}
                    attempt={attempt}
                    isNewest={index === visibleAttempts.length - 1}
                  />
                ))}
              </ul>
              {hiddenAttempts > 0 ? (
                <p className="tnum mt-2 text-meta text-muted">+{hiddenAttempts}</p>
              ) : null}
            </div>
          ) : null}
        </div>
        </section>

        {!tight ? (
          <aside
            aria-label={t("stats.title")}
            className="panel-scroll hidden min-w-0 xl:sticky xl:top-20 xl:block xl:max-h-[calc(100dvh-6rem)] xl:overflow-y-auto"
          >
            {/* Padding kanan menjaga teks tidak berada di bawah jalur
                scrollbar, yang di panel ini ada di sisi kanan. */}
            <div className="pr-2.5">
              <h2 className="mb-4 border-b border-line pb-2 text-ui font-semibold">
                {t("stats.title")}
              </h2>
              <StatsPanel stats={stats} />
            </div>
          </aside>
        ) : null}
      </div>

      {loaded && status !== "playing" ? (
        <RevealDialog
          open={revealOpen}
          song={loaded.song}
          artworkUrl={loaded.artworkUrl}
          status={status}
          attempts={attempts}
          gaveUp={gaveUp}
          streak={stats.streak}
          onClose={() => setRevealOpen(false)}
          onPlayAgain={() => void startRound()}
        />
      ) : null}
    </>
  );
}

interface GameStatusProps {
  phase: Phase;
  failure: AudioFailure | "upstream" | null;
  swappedFrom: string | null;
  attemptsLeft: number;
  message: string;
  status: RoundStatus;
  onRetry: () => void;
}

/**
 * Keadaan kosong, memuat, dan error dipisah per penyebab, karena tindakan
 * pemulihannya berbeda (design.md 9.2 dan 9.3). Tidak ada pesan "tidak ada data".
 */
function GameStatus({
  phase,
  failure,
  swappedFrom,
  attemptsLeft,
  message,
  status,
  onRetry,
}: GameStatusProps) {
  const { t } = useTranslation();

  if (phase === "empty") {
    return (
      <div className="w-full rounded-panel border border-line bg-surface p-4 text-center">
        <p className="text-ui">{t("empty.noSongMatch")}</p>
        <p className="mt-1 text-meta text-muted">{t("empty.noSongMatchAction")}</p>
      </div>
    );
  }

  if (failure) {
    const copy: Record<string, { title: string; hint: string; retry: boolean }> = {
      offline: { title: t("error.offline"), hint: t("error.offlineHint"), retry: true },
      fetch: {
        title: t("error.fetchFailed"),
        hint: t("error.fetchFailedHint"),
        retry: true,
      },
      upstream: {
        title: t("error.fetchFailed"),
        hint: t("error.fetchFailedHint"),
        retry: true,
      },
      "no-preview": { title: t("error.noPreview"), hint: "", retry: true },
      decode: { title: t("error.decodeFailed"), hint: "", retry: true },
      "needs-gesture": {
        title: t("error.needTap"),
        hint: t("error.needTapHint"),
        retry: false,
      },
    };
    const entry = copy[failure] ?? copy.fetch!;

    return (
      <div
        role="alert"
        className="w-full rounded-panel border border-line bg-surface p-4 text-center"
      >
        <p className="text-ui text-wrong">{entry.title}</p>
        {entry.hint ? <p className="mt-1 text-meta text-muted">{entry.hint}</p> : null}
        {entry.retry ? (
          <div className="mt-3 flex justify-center gap-2">
            <Button variant="secondary" onClick={onRetry}>
              {t("common.retry")}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  if (phase === "resolving") {
    return (
      <p role="status" className="text-meta text-muted">
        {t("game.loadingClip")}
      </p>
    );
  }

  return (
    <div className="flex min-h-10 w-full flex-col items-center gap-1 text-center">
      {swappedFrom ? (
        <p className="text-meta text-muted">
          {t("error.songSwapped", { title: swappedFrom })}
        </p>
      ) : null}
      {/* Perubahan durasi dan hasil tebakan dibacakan tanpa memindah fokus. */}
      <p aria-live="polite" aria-label={t("a11y.liveRegion")} className="text-ui">
        {message ||
          (status === "playing" ? t("game.attemptsLeft", { count: attemptsLeft }) : "")}
      </p>
    </div>
  );
}
