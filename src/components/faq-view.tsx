"use client";

import { useTranslation } from "react-i18next";
import { ContentPage } from "./content-page";

/**
 * Tujuh pertanyaan, semuanya datang dari mekanik dan batasan produk ini.
 * Tidak ada "apakah data saya aman" atau "bisa batal langganan": produk ini
 * tidak punya langganan dan tidak mengumpulkan data pribadi (R-28).
 */
export function FaqView() {
  const { t } = useTranslation();
  const items = Array.from({ length: 7 }, (_, index) => ({
    q: t(`faq.q${index + 1}`),
    a: t(`faq.a${index + 1}`),
  }));

  return (
    <ContentPage title={t("faq.title")}>
      <p className="text-muted">{t("faq.intro")}</p>
      <div className="border-t border-line">
        {items.map((item) => (
          <details key={item.q} className="border-b border-line">
            <summary className="flex min-h-11 cursor-pointer items-center py-3 text-ui marker:content-none">
              {item.q}
            </summary>
            <p className="pb-4 text-muted">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="text-meta text-muted">{t("game.shortcutHint")}</p>
    </ContentPage>
  );
}
