"use client";

import { useTranslation } from "react-i18next";
import { CLIP_STEPS, LADDER_SIZE, formatClip } from "@/lib/game";
import { winRate, type Stats } from "@/lib/stats";

/**
 * Satu-satunya angka nyata di produk ini adalah angka milik pemain sendiri,
 * jadi tidak ada metrik publik di mana pun (R-17).
 *
 * Distribusi tidak dipertahankan sebagai tabel di layar sempit: ia memang
 * daftar baris label-plus-bilah, yang menghindari sumber luapan horizontal
 * paling umum (design.md 7.3).
 */
export function StatsPanel({ stats }: { stats: Stats }) {
  const { t } = useTranslation();

  if (stats.played === 0) {
    return (
      <p className="text-ui text-muted">{t("stats.empty")}</p>
    );
  }

  const peak = Math.max(1, ...stats.distribution);

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-3">
        {[
          { label: t("stats.streak"), value: stats.streak },
          { label: t("stats.bestStreak"), value: stats.bestStreak },
          { label: t("stats.played"), value: stats.played },
          { label: t("stats.winRate"), value: `${winRate(stats)}%` },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-panel border border-line bg-raised px-3 py-2"
          >
            <dt className="text-meta text-muted">{item.label}</dt>
            <dd className="tnum text-h2">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <h4 className="mb-2 text-meta text-muted">{t("stats.distribution")}</h4>
        <ul className="flex flex-col gap-1.5">
          {stats.distribution.map((count, index) => {
            const isMiss = index === LADDER_SIZE;
            const label = isMiss
              ? t("stats.neverGuessed")
              : t("stats.distributionRow", {
                  duration: formatClip(CLIP_STEPS[index] ?? CLIP_STEPS[0]),
                });
            return (
              <li key={label} className="flex items-center gap-2">
                <span className="tnum w-24 shrink-0 text-meta text-muted">
                  {label}
                </span>
                <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-sharp bg-raised">
                  <span
                    className={`block h-full rounded-sharp ${isMiss ? "bg-ladder-idle" : "bg-ladder-fill"}`}
                    style={{ width: `${(count / peak) * 100}%` }}
                  />
                </span>
                <span className="tnum w-6 shrink-0 text-right text-meta">
                  {count}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-meta text-muted">{t("stats.local")}</p>
    </div>
  );
}
