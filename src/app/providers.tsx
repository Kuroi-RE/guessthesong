"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import i18next, { type i18n as I18nInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { DEFAULT_FILTERS, type CatalogFilters } from "@/lib/catalog";
import { GameBridgeProvider } from "./game-bridge";
import {
  SSR_LOCALE,
  detectLocale,
  isLocale,
  resources,
  type Locale,
} from "@/i18n/config";

export type ThemeChoice = "dark" | "light" | "system";
export type LayoutChoice = "wide" | "tight";
export type StartFrom = "beginning" | "elsewhere";

export interface Settings {
  locale: Locale;
  theme: ThemeChoice;
  layout: LayoutChoice;
  filters: CatalogFilters;
  volume: number;
  startFrom: StartFrom;
  seenOnboarding: boolean;
}

const STORAGE_KEY = "tebaklagu.settings.v1";

const DEFAULTS: Settings = {
  locale: SSR_LOCALE,
  theme: "system",
  layout: "wide",
  filters: DEFAULT_FILTERS,
  volume: 0.8,
  startFrom: "beginning",
  seenOnboarding: false,
};

interface SettingsApi {
  settings: Settings;
  ready: boolean;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeChoice) => void;
  setLayout: (layout: LayoutChoice) => void;
  setFilters: (filters: CatalogFilters) => void;
  setVolume: (volume: number) => void;
  setStartFrom: (startFrom: StartFrom) => void;
  markOnboardingSeen: () => void;
}

const SettingsContext = createContext<SettingsApi | null>(null);

export function useSettings(): SettingsApi {
  const api = useContext(SettingsContext);
  if (!api) throw new Error("useSettings dipakai di luar Providers");
  return api;
}

function readStored(): Partial<Settings> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Partial<Settings>)
      : {};
  } catch {
    return {};
  }
}

function applyTheme(choice: ThemeChoice): void {
  const resolved =
    choice === "system"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : choice;
  document.documentElement.dataset.theme = resolved;
}

function createI18n(locale: Locale): I18nInstance {
  const instance = i18next.createInstance();
  void instance.init({
    resources,
    lng: locale,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });
  return instance;
}

export function Providers({ children }: { children: ReactNode }) {
  // Instance i18next dibuat sekali dengan bahasa SSR, lalu bahasanya diganti
  // setelah hidrasi. Membuatnya ulang akan membuang state komponen di bawahnya.
  const i18nRef = useRef<I18nInstance>(undefined);
  if (!i18nRef.current) i18nRef.current = createI18n(SSR_LOCALE);
  const i18n = i18nRef.current;

  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStored();
    const locale = detectLocale(
      isLocale(stored.locale) ? stored.locale : null,
      navigator.language,
    );
    const next: Settings = {
      ...DEFAULTS,
      ...stored,
      locale,
      filters: { ...DEFAULT_FILTERS, ...(stored.filters ?? {}) },
    };
    setSettings(next);
    setReady(true);
    if (locale !== i18n.language) void i18n.changeLanguage(locale);
    applyTheme(next.theme);
  }, [i18n]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Penyimpanan diblokir. Pengaturan tetap berlaku untuk sesi ini.
    }
  }, [settings, ready]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = settings.locale;
  }, [settings.locale, ready]);

  // Tema "ikut sistem" harus ikut berubah saat pemain mengganti pengaturan OS
  // selagi halaman terbuka, bukan hanya saat halaman dimuat.
  useEffect(() => {
    if (settings.theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [settings.theme]);

  const patch = useCallback((part: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...part }));
  }, []);

  const api = useMemo<SettingsApi>(
    () => ({
      settings,
      ready,
      setLocale: (locale) => {
        patch({ locale });
        void i18n.changeLanguage(locale);
      },
      setTheme: (theme) => {
        patch({ theme });
        applyTheme(theme);
      },
      setLayout: (layout) => patch({ layout }),
      setFilters: (filters) => patch({ filters }),
      setVolume: (volume) => patch({ volume }),
      setStartFrom: (startFrom) => patch({ startFrom }),
      markOnboardingSeen: () => patch({ seenOnboarding: true }),
    }),
    [settings, ready, patch, i18n],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <SettingsContext.Provider value={api}>
        <GameBridgeProvider>{children}</GameBridgeProvider>
      </SettingsContext.Provider>
    </I18nextProvider>
  );
}
