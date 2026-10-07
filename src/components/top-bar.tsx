"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/app/providers";
import { useGameBridge } from "@/app/game-bridge";
import { readStats, EMPTY_STATS, type Stats } from "@/lib/stats";
import { IconMenu } from "./icons";
import { Button } from "./ui";
import { SettingsDrawer } from "./settings-drawer";

/**
 * Bilah atas tinggi 56px dan hanya memuat tiga elemen, karena setiap piksel
 * tinggi bilah ini adalah piksel yang hilang dari game (design.md 6.3).
 *
 * Toggle bahasa ada di sini, bukan di drawer, supaya pemain yang membuka situs
 * dengan bahasa salah bisa memperbaikinya tanpa mencari (design.md Bagian 12).
 */
export function TopBar() {
  const { t } = useTranslation();
  const { settings, setLocale } = useSettings();
  const { reroll } = useGameBridge();

  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);

  // Statistik dibaca saat drawer dibuka, jadi angkanya selalu angka terbaru
  // tanpa drawer perlu berlangganan ke state game.
  useEffect(() => {
    if (open) setStats(readStats());
  }, [open]);

  const tight = settings.layout === "tight";

  return (
    <>
      {tight ? (
        <div className="fixed right-3 top-3 z-30">
          <Button
            variant="secondary"
            onClick={() => setOpen(true)}
            aria-label={t("a11y.openMenu")}
          >
            <IconMenu className="size-5" />
            {t("common.menu")}
          </Button>
        </div>
      ) : (
        <header className="sticky top-0 z-30 border-b border-line bg-surface">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-control text-ui font-extrabold tracking-tight"
            >
              Tebak<span className="text-brand-text">Lagu</span>
            </Link>

            <div className="flex items-center gap-2">
              <div
                role="group"
                aria-label={t("a11y.languageGroup")}
                className="flex overflow-hidden rounded-control border border-line"
              >
                {(["id", "en"] as const).map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => setLocale(locale)}
                    aria-pressed={settings.locale === locale}
                    className={`min-h-11 px-3 text-ui uppercase transition-colors ${
                      settings.locale === locale
                        ? "bg-brand-deep text-ink-50"
                        : "text-muted hover:text-text"
                    }`}
                  >
                    {locale}
                  </button>
                ))}
              </div>

              {/* Tombol Menu hanya ada di bawah 1280px. Di atas itu pengaturan
                  punya kolomnya sendiri, dan display:none membuat tombol ini
                  benar-benar keluar dari urutan Tab, bukan cuma tak terlihat
                  (design.md 6.6). */}
              <div className="xl:hidden">
                <Button
                  variant="secondary"
                  onClick={() => setOpen(true)}
                  aria-label={t("a11y.openMenu")}
                >
                  <IconMenu className="size-5" />
                  {t("common.menu")}
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      <SettingsDrawer
        open={open}
        onClose={() => setOpen(false)}
        stats={stats}
        onReroll={reroll}
      />
    </>
  );
}
