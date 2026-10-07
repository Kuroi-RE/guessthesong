"use client";

import { useTranslation } from "react-i18next";
import { useSettings } from "./providers";
import { Game } from "@/components/game";
import { TopBar } from "@/components/top-bar";
import {
  GenreGrid,
  HowToPlay,
  QuickQuestions,
  SiteFooter,
} from "@/components/content-sections";

export default function HomePage() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const tight = settings.layout === "tight";

  return (
    <>
      <a
        href="#game"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-40 focus:rounded-control focus:border focus:border-brand focus:bg-surface focus:px-3 focus:py-2 focus:text-ui"
      >
        {t("a11y.skipToGame")}
      </a>

      <TopBar />

      {/* Padding vertikal turun satu register di layar sempit, supaya halaman
          tidak menggulir melewati ruang kosong (design.md 7.2). */}
      <main className={tight ? "px-4 pb-8 pt-10" : "px-4 pb-12 pt-8 sm:pt-12"}>
        {!tight ? (
          <div className="mx-auto mb-8 w-full max-w-[520px] text-center sm:mb-10">
            <h1 className="text-h1">{t("game.title")}</h1>
            <p className="mt-2 text-muted">{t("game.subtitle")}</p>
          </div>
        ) : null}

        <Game />
      </main>

      {/* Layout Rapat hanya merender panel game (design.md 7.5). */}
      {!tight ? (
        <>
          {/* Jeda paling besar di halaman ini: menandai peralihan dari
              bermain ke membaca (design.md 5.2). */}
          <div className="pt-16 sm:pt-24">
            <HowToPlay />
          </div>
          <div className="pt-12">
            <GenreGrid />
          </div>
          <div className="pt-12">
            <QuickQuestions />
          </div>
          <SiteFooter />
        </>
      ) : null}
    </>
  );
}
