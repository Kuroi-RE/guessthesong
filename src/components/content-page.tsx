"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { TopBar } from "./top-bar";
import { SiteFooter } from "./content-sections";
import { LadderRule } from "./ui";

/**
 * Kerangka halaman konten. Komposisinya berbeda dari layar game: satu kolom
 * terbatas 62ch, judul rata kiri, dan ruang antar bagian lebih besar, karena
 * di sini pekerjaannya membaca, bukan menekan tombol (design.md 5.2).
 */
export function ContentPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-[62ch] px-4 pb-12 pt-8 sm:pt-12">
        <h1 className="text-h1">{title}</h1>
        {updated ? <p className="mt-2 text-meta text-muted">{updated}</p> : null}
        <div className="mt-6">
          <LadderRule />
        </div>
        <div className="mt-8 flex flex-col gap-8">{children}</div>
        <Link
          href="/#game"
          className="mt-10 inline-flex min-h-11 items-center text-ui text-brand-text underline decoration-line-strong underline-offset-4"
        >
          {t("common.backToGame")}
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}

/** Satu bagian prosa pada halaman legal. */
export function Clause({ heading, body }: { heading: string; body: string }) {
  return (
    <section>
      <h2 className="text-h2">{heading}</h2>
      <p className="mt-2 text-muted">{body}</p>
    </section>
  );
}
