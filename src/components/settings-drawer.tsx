"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Drawer } from "./overlay";
import { Button } from "./ui";
import { IconClose } from "./icons";
import { SettingsPanel } from "./settings-panel";
import type { Stats } from "@/lib/stats";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  stats: Stats;
  /** null di halaman konten: tidak ada ronde yang bisa diacak ulang di sana. */
  onReroll: (() => void) | null;
}

/**
 * Jalan ke pengaturan di bawah 1152px, tempat tidak ada ruang horizontal untuk
 * dibagi tiga. Di atas lebar itu pengaturan punya kolomnya sendiri dan drawer
 * ini tidak dipakai sama sekali (design.md 6.6).
 */
export function SettingsDrawer({
  open,
  onClose,
  stats,
  onReroll,
}: SettingsDrawerProps) {
  const { t } = useTranslation();
  const titleId = useId();

  return (
    <Drawer open={open} onClose={onClose} labelledBy={titleId}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={titleId} className="text-h2">
          {t("common.menu")}
        </h2>
        <Button variant="quiet" onClick={onClose} aria-label={t("a11y.closeMenu")}>
          <IconClose className="size-5" />
        </Button>
      </div>

      <SettingsPanel
        variant="drawer"
        stats={stats}
        onReroll={onReroll}
        onDone={onClose}
      />
    </Drawer>
  );
}
