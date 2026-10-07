"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { suggest, type Highlight, type Suggestion } from "@/lib/catalog";
import type { CatalogSong } from "@/lib/catalog-types";
import { Button } from "./ui";

interface GuessInputProps {
  pool: readonly CatalogSong[];
  disabled: boolean;
  /** Fokus otomatis hanya di desktop: di HP keyboard virtual menutup tombol Putar. */
  autoFocusOnDesktop: boolean;
  onGuess: (song: CatalogSong) => void;
}

/**
 * Bagian yang cocok ditebalkan, tidak diwarnai: warna merek tetap hanya
 * berarti keadaan game, bukan "teks ini cocok" (design.md 8.2).
 */
function Marked({ text, range }: { text: string; range: Highlight }) {
  if (!range) return <>{text}</>;
  return (
    <>
      {text.slice(0, range.from)}
      <strong className="font-semibold">{text.slice(range.from, range.to)}</strong>
      {text.slice(range.to)}
    </>
  );
}

export function GuessInput({
  pool,
  disabled,
  autoFocusOnDesktop,
  onGuess,
}: GuessInputProps) {
  const { t } = useTranslation();
  const listId = useId();
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState<CatalogSong | null>(null);

  const suggestions = useMemo(() => suggest(query, pool), [query, pool]);
  const showEmpty = open && query.trim().length >= 2 && suggestions.length === 0;

  useEffect(() => {
    if (!autoFocusOnDesktop) return;
    if (window.matchMedia("(min-width: 768px)").matches) {
      inputRef.current?.focus();
    }
  }, [autoFocusOnDesktop]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  function choose(suggestion: Suggestion) {
    setPicked(suggestion.song);
    setQuery(suggestion.matchedTitle);
    setOpen(false);
    inputRef.current?.focus();
  }

  function submit() {
    if (!picked) return;
    onGuess(picked);
    setPicked(null);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index - 1 + suggestions.length) % suggestions.length);
      return;
    }
    if (event.key === "Escape") {
      if (open) {
        // Daftar ditutup tanpa mengosongkan field: pemain belum tentu ingin
        // membuang apa yang sudah dia ketik (design.md 8.2).
        event.stopPropagation();
        setOpen(false);
      }
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const highlighted = open ? suggestions[active] : undefined;
      if (highlighted) {
        choose(highlighted);
      } else if (picked) {
        submit();
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <label htmlFor={inputId} className="sr-only">
          {t("game.placeholder")}
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open && (suggestions.length > 0 || showEmpty)}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-describedby={picked ? undefined : hintId}
          aria-activedescendant={
            open && suggestions[active] ? `${listId}-${active}` : undefined
          }
          disabled={disabled}
          placeholder={t("game.placeholder")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPicked(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(query.trim().length >= 2)}
          onKeyDown={onKeyDown}
          className="h-12 w-full rounded-control border border-line bg-raised px-3 text-ui text-text placeholder:text-muted focus:border-brand disabled:opacity-55"
        />

        {open && suggestions.length > 0 ? (
          <ul
            id={listId}
            role="listbox"
            className="elev-panel absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-panel border border-line bg-surface"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.song.id}-${suggestion.matchedTitle}`}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                className={index === active ? "bg-raised" : ""}
              >
                <button
                  type="button"
                  // Pointer-down, bukan click: click datang setelah blur dan
                  // daftarnya sudah tertutup sebelum pilihan terbaca.
                  onPointerDown={(event) => {
                    event.preventDefault();
                    choose(suggestion);
                  }}
                  onMouseEnter={() => setActive(index)}
                  className="flex min-h-11 w-full flex-col items-start justify-center px-3 py-2 text-left"
                >
                  <span className="w-full truncate text-ui text-text">
                    <Marked
                      text={suggestion.matchedTitle}
                      range={suggestion.titleHighlight}
                    />
                  </span>
                  <span className="w-full truncate text-meta text-muted">
                    <Marked
                      text={suggestion.song.artist}
                      range={suggestion.artistHighlight}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {showEmpty ? (
          <div
            id={listId}
            role="status"
            className="elev-panel absolute left-0 right-0 top-[calc(100%+4px)] z-20 rounded-panel border border-line bg-surface px-3 py-3"
          >
            <p className="text-ui text-text">{t("empty.noSuggestions")}</p>
            <p className="text-meta text-muted">{t("empty.noSuggestionsHint")}</p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          disabled={disabled || !picked}
          onClick={submit}
          className="flex-1"
        >
          {t("common.guess")}
        </Button>
      </div>

      {/* Keadaan nonaktif dijelaskan teks, tidak hanya diredupkan (design.md 8.2). */}
      {!picked ? (
        <p id={hintId} className="text-meta text-muted">
          {t("game.guessDisabledHint")}
        </p>
      ) : null}
    </div>
  );
}
