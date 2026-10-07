"use client";

import Link from "next/link";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Button, GroupLabel } from "./ui";
import { IconVolume } from "./icons";
import { StatsPanel } from "./stats-panel";
import { useSettings } from "@/app/providers";
import { GENRE_IDS, DIFFICULTY_IDS, ERA_IDS } from "@/lib/catalog-types";
import { filterCatalog } from "@/lib/catalog";
import type { Stats } from "@/lib/stats";

/**
 * Isi pengaturan, dipakai di dua tempat dengan satu sumber: kolom kiri di
 * desktop dan drawer di layar sempit (design.md 6.6).
 *
 * Varian menentukan kelompok mana yang dirender, dan tiap pengecualian punya
 * alasan yang ditulis di design.md 6.6: bahasa sudah ada di bilah atas,
 * statistik punya kolomnya sendiri di kanan, dan tautan lainnya sudah ada di
 * footer. Di drawer ketiganya ikut, karena di layout Rapat bilah atas dan
 * footer tidak dirender.
 */
export type SettingsVariant = "inline" | "drawer";

interface SettingsPanelProps {
  variant: SettingsVariant;
  stats: Stats;
  /** null di halaman konten: tidak ada ronde yang bisa diacak ulang di sana. */
  onReroll: (() => void) | null;
  /** Dipanggil setelah tindakan yang sebaiknya menutup drawer. */
  onDone?: () => void;
}

export function SettingsPanel({
  variant,
  stats,
  onReroll,
  onDone,
}: SettingsPanelProps) {
  const { t } = useTranslation();
  const volumeId = useId();
  const {
    settings,
    setLocale,
    setTheme,
    setLayout,
    setFilters,
    setVolume,
    setStartFrom,
  } = useSettings();

  const isDrawer = variant === "drawer";
  const matching = filterCatalog(settings.filters).length;

  return (
    <div className="flex flex-col gap-6">
      {isDrawer ? (
        <section>
          <GroupLabel>{t("settings.language")}</GroupLabel>
          <div className="flex gap-2" role="group" aria-label={t("a11y.languageGroup")}>
            <Button
              variant="chip"
              selected={settings.locale === "id"}
              onClick={() => setLocale("id")}
            >
              Indonesia
            </Button>
            <Button
              variant="chip"
              selected={settings.locale === "en"}
              onClick={() => setLocale("en")}
            >
              English
            </Button>
          </div>
        </section>
      ) : null}

      <section>
        <GroupLabel>{t("settings.theme")}</GroupLabel>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t("a11y.themeGroup")}
        >
          {(["dark", "light", "system"] as const).map((choice) => (
            <Button
              key={choice}
              variant="chip"
              selected={settings.theme === choice}
              onClick={() => setTheme(choice)}
            >
              {choice === "dark"
                ? t("settings.themeDark")
                : choice === "light"
                  ? t("settings.themeLight")
                  : t("settings.themeSystem")}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <GroupLabel>{t("settings.song")}</GroupLabel>

        <p className="mb-2 text-meta text-muted">{t("settings.genre")}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant="chip"
            selected={settings.filters.genre === "all"}
            onClick={() => setFilters({ ...settings.filters, genre: "all" })}
          >
            {t("genre.all")}
          </Button>
          {GENRE_IDS.map((genre) => (
            <Button
              key={genre}
              variant="chip"
              selected={settings.filters.genre === genre}
              onClick={() => setFilters({ ...settings.filters, genre })}
            >
              {t(`genre.${genre}`)}
            </Button>
          ))}
        </div>

        <p className="mb-2 text-meta text-muted">{t("settings.era")}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant="chip"
            selected={settings.filters.era === "any"}
            onClick={() => setFilters({ ...settings.filters, era: "any" })}
          >
            {t("era.any")}
          </Button>
          {ERA_IDS.map((era) => (
            <Button
              key={era}
              variant="chip"
              selected={settings.filters.era === era}
              onClick={() => setFilters({ ...settings.filters, era })}
            >
              {t(`era.${era}`)}
            </Button>
          ))}
        </div>

        <p className="mb-2 text-meta text-muted">{t("settings.difficulty")}</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {DIFFICULTY_IDS.map((difficulty) => (
            <Button
              key={difficulty}
              variant="chip"
              selected={settings.filters.difficulty === difficulty}
              onClick={() => setFilters({ ...settings.filters, difficulty })}
            >
              {t(`difficulty.${difficulty}`)}
            </Button>
          ))}
        </div>

        {/* Jumlah lagu dihitung dari katalog, bukan angka yang ditulis tangan. */}
        <p className="mb-3 text-meta text-muted">
          {t("settings.matchingCount", { count: matching })}
        </p>

        {onReroll ? (
          <Button
            variant="secondary"
            onClick={() => {
              onReroll();
              onDone?.();
            }}
          >
            {t("settings.reroll")}
          </Button>
        ) : null}
      </section>

      <section>
        <GroupLabel>{t("settings.audio")}</GroupLabel>
        <label
          htmlFor={volumeId}
          className="mb-2 flex items-center gap-2 text-meta text-muted"
        >
          <IconVolume className="size-4" />
          {t("settings.volume")}
        </label>
        <input
          id={volumeId}
          type="range"
          min={0}
          max={100}
          step={5}
          value={Math.round(settings.volume * 100)}
          onChange={(event) => setVolume(Number(event.target.value) / 100)}
          className="mb-4 h-11 w-full accent-[var(--color-brand)]"
        />

        <p className="mb-2 text-meta text-muted">{t("settings.startFrom")}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="chip"
            selected={settings.startFrom === "beginning"}
            onClick={() => setStartFrom("beginning")}
          >
            {t("settings.startFromBeginning")}
          </Button>
          <Button
            variant="chip"
            selected={settings.startFrom === "elsewhere"}
            onClick={() => setStartFrom("elsewhere")}
          >
            {t("settings.startFromElsewhere")}
          </Button>
        </div>
      </section>

      <section>
        <GroupLabel>{t("settings.display")}</GroupLabel>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t("a11y.layoutGroup")}
        >
          <Button
            variant="chip"
            selected={settings.layout === "wide"}
            onClick={() => setLayout("wide")}
          >
            {t("settings.layoutWide")}
          </Button>
          <Button
            variant="chip"
            selected={settings.layout === "tight"}
            onClick={() => setLayout("tight")}
          >
            {t("settings.layoutTight")}
          </Button>
        </div>
        <p className="mt-2 text-meta text-muted">{t("settings.layoutTightNote")}</p>
      </section>

      {isDrawer ? (
        <>
          <section>
            <GroupLabel>{t("stats.title")}</GroupLabel>
            <StatsPanel stats={stats} />
          </section>

          <section>
            <GroupLabel>{t("settings.other")}</GroupLabel>
            <ul className="flex flex-col">
              {[
                { href: "/#cara-main", label: t("footer.howTo") },
                { href: "/faq", label: t("footer.faq") },
                { href: "/genre", label: t("genre.title") },
                { href: "/privasi", label: t("footer.privacy") },
                { href: "/ketentuan", label: t("footer.terms") },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onDone}
                    className="flex min-h-11 items-center rounded-control px-1 text-ui text-text hover:text-brand-text"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}
