import en from "@locales/en.json";
import id from "@locales/id.json";

export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Bahasa yang dirender di server adalah Indonesia, karena pasar utama produk
 * ini Indonesia (PRD bagian 1 dan 2), jadi HTML yang dibaca mesin pencari
 * sebaiknya sudah berbahasa Indonesia. Deteksi navigator.language dan pilihan
 * tersimpan baru berlaku setelah hidrasi (PRD R-17), karena keduanya hanya ada
 * di browser.
 */
export const SSR_LOCALE: Locale = "id";

export const resources = {
  id: { translation: id },
  en: { translation: en },
} as const;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function detectLocale(stored: string | null, browser: string | undefined): Locale {
  if (isLocale(stored)) return stored;
  const tag = (browser ?? "").toLowerCase();
  if (tag.startsWith("id")) return "id";
  return "en";
}
