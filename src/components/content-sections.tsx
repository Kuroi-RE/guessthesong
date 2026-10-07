"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { countByGenre } from "@/lib/catalog";
import { GENRE_IDS } from "@/lib/catalog-types";
import { LadderRule } from "./ui";

/**
 * Alur nyata dari PRD bagian 5, dengan percabangan. Bukan tiga ikon bulat
 * bernomor: jumlah langkahnya tiga karena alurnya memang tiga (design.md 6.5).
 */
export function HowToPlay() {
  const { t } = useTranslation();
  return (
    <section id="cara-main" className="mx-auto w-full max-w-[62ch] px-4">
      <LadderRule />
      <h2 className="mt-8 text-h1">{t("howTo.title")}</h2>

      <ol className="mt-6 flex flex-col gap-6">
        <li className="flex gap-4">
          <span className="tnum shrink-0 text-h2 text-brand-text">01</span>
          <p>{t("howTo.step1")}</p>
        </li>

        <li className="flex gap-4">
          <span className="tnum shrink-0 text-h2 text-brand-text">02</span>
          <div>
            <p>{t("howTo.step2")}</p>
            {/* Percabangan ditandai indentasi dan garis vertikal 1px,
                bukan stripe berwarna (design.md 6.5). */}
            <ul className="mt-3 flex flex-col gap-2 border-l border-line pl-4">
              <li className="text-ui">{t("howTo.branchCorrect")}</li>
              <li className="text-ui">{t("howTo.branchWrong")}</li>
            </ul>
          </div>
        </li>

        <li className="flex gap-4">
          <span className="tnum shrink-0 text-h2 text-brand-text">03</span>
          <p>{t("howTo.step3")}</p>
        </li>
      </ol>

      <h3 className="mt-10 text-h2">{t("howTo.adjust")}</h3>
      <p className="mt-2 text-muted">{t("howTo.adjustBody")}</p>
    </section>
  );
}

/**
 * Grid tautan padat. Komposisinya sengaja berbeda dari bagian Cara Main dan
 * dari daftar pertanyaan, sesuai dial RHYTHM 2 (design.md 6.3).
 */
export function GenreGrid() {
  const { t } = useTranslation();
  const counts = countByGenre();

  return (
    <section id="genre" className="mx-auto w-full max-w-5xl px-4">
      <h2 className="text-h2">{t("genre.title")}</h2>
      <p className="mt-1 text-meta text-muted">{t("genre.intro")}</p>

      <ul className="mt-4 grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
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
    </section>
  );
}

/**
 * Daftar accordion rata kiri tanpa kartu. Dibangun dari details dan summary,
 * jadi buka tutupnya bekerja dengan keyboard tanpa kode tambahan.
 */
export function QuickQuestions() {
  const { t } = useTranslation();
  const items = [
    { q: t("quick.q1"), a: t("quick.a1") },
    { q: t("quick.q2"), a: t("quick.a2") },
    { q: t("quick.q3"), a: t("quick.a3") },
  ];

  return (
    <section id="tanya" className="mx-auto w-full max-w-[62ch] px-4">
      <h2 className="text-h2">{t("quick.title")}</h2>
      <div className="mt-4 border-t border-line">
        {items.map((item) => (
          <details key={item.q} className="group border-b border-line">
            <summary className="flex min-h-11 cursor-pointer items-center py-3 text-ui marker:content-none">
              {item.q}
            </summary>
            <p className="pb-4 text-muted">{item.a}</p>
          </details>
        ))}
      </div>
      <Link
        href="/faq"
        className="mt-4 inline-flex min-h-11 items-center text-ui text-brand-text underline decoration-line-strong underline-offset-4"
      >
        {t("common.allQuestions")}
      </Link>
    </section>
  );
}

/** Satu kolom, karena produk ini hanya punya satu kelompok tautan (design.md 6.3). */
export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <nav aria-label={t("settings.other")}>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {[
              { href: "/#cara-main", label: t("footer.howTo") },
              { href: "/faq", label: t("footer.faq") },
              { href: "/privasi", label: t("footer.privacy") },
              { href: "/ketentuan", label: t("footer.terms") },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center text-ui text-muted hover:text-text"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-4 max-w-[62ch] text-meta text-muted">
          {t("footer.attribution")}
        </p>
        <p className="mt-1 text-meta text-muted">{t("footer.owner")}</p>
      </div>
    </footer>
  );
}
