"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/app/providers";
import { countByGenre } from "@/lib/catalog";
import { GENRE_IDS, type GenreId } from "@/lib/catalog-types";
import { ContentPage } from "./content-page";
import { TopBar } from "./top-bar";
import { SiteFooter } from "./content-sections";
import { Game } from "./game";

export function GenreIndexView() {
  const { t } = useTranslation();
  const counts = countByGenre();

  return (
    <ContentPage title={t("genre.title")}>
      <p className="text-muted">{t("genre.intro")}</p>
      <ul className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
        {GENRE_IDS.map((genre) => (
          <li key={genre}>
            <Link
              href={`/genre/${genre}`}
              className="flex min-h-11 flex-col justify-center rounded-control border border-line bg-surface px-3 py-2 transition-colors hover:border-brand hover:text-brand-text"
            >
              <span className="text-ui">{t(`genre.${genre}`)}</span>
              <span className="tnum text-meta text-muted">{counts[genre] ?? 0}</span>
            </Link>
          </li>
        ))}
      </ul>
    </ContentPage>
  );
}

/**
 * Halaman genre memasang filter lalu menjalankan game yang sama.
 * Filter yang tersimpan sengaja ditimpa di sini, karena pemain datang ke URL
 * ini justru untuk genre itu.
 */
export function GenreGameView({ genre }: { genre: GenreId }) {
  const { t } = useTranslation();
  const { settings, setFilters, ready } = useSettings();

  useEffect(() => {
    if (!ready) return;
    if (settings.filters.genre === genre) return;
    setFilters({ ...settings.filters, genre });
  }, [ready, genre, settings.filters, setFilters]);

  return (
    <>
      <TopBar />
      <main className="px-4 pb-12 pt-8 sm:pt-12">
        <div className="mx-auto mb-8 w-full max-w-[520px] text-center">
          <h1 className="text-h1">{t(`genre.${genre}`)}</h1>
          <p className="mt-2 text-muted">{t("game.subtitle")}</p>
        </div>
        <Game />
      </main>
      <div className="mx-auto w-full max-w-[62ch] px-4 pt-10">
        <Link
          href="/genre"
          className="inline-flex min-h-11 items-center text-ui text-brand-text underline decoration-line-strong underline-offset-4"
        >
          {t("genre.title")}
        </Link>
      </div>
      <SiteFooter />
    </>
  );
}
