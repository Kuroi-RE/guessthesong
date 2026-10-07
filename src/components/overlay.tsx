"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Fokus dikurung selama panel terbuka dan dikembalikan ke pemicunya setelah
 * ditutup (R-32). Tanpa pengembalian fokus, pemain keyboard terbuang ke awal
 * halaman setiap kali menutup menu.
 */
function useFocusTrap(open: boolean, onClose: () => void) {
  const container = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;

    const node = container.current;
    if (node) {
      const first = node.querySelector<HTMLElement>("[data-autofocus]") ??
        node.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }

    const body = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !container.current) return;

      const items = [...container.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = body;
      returnTo.current?.focus();
    };
  }, [open, onClose]);

  return container;
}

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
}

/**
 * Dialog hasil. Overlay-nya gelap tanpa blur: dosis blur di produk ini hanya
 * satu, dan dipakai pada overlay drawer (design.md 2.3).
 */
export function Dialog({ open, onClose, labelledBy, children }: OverlayProps) {
  const close = useCallback(() => onClose(), [onClose]);
  const container = useFocusTrap(open, close);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 cursor-default bg-ink-900/80"
      />
      <div
        ref={container}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="elev-panel relative m-3 max-h-[88dvh] w-full max-w-[420px] animate-[panel-enter_180ms_ease-out_1] overflow-y-auto rounded-panel border border-line bg-surface p-4 safe-b"
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Drawer pengaturan. Geser dari kanan di L ke atas dan dari bawah di layar
 * sempit, karena ibu jari berada di bawah layar (design.md 7.4).
 */
export function Drawer({ open, onClose, labelledBy, children }: OverlayProps) {
  const close = useCallback(() => onClose(), [onClose]);
  const container = useFocusTrap(open, close);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end md:items-stretch">
      {/* Satu-satunya pemakaian blur di produk ini: memundurkan game ke belakang. */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 cursor-default bg-ink-900/70 backdrop-blur-sm"
      />
      <div
        ref={container}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="elev-panel relative flex max-h-[85dvh] w-full flex-col overflow-y-auto rounded-t-panel border border-line bg-surface p-4 safe-b md:max-h-none md:w-[360px] md:rounded-none md:rounded-l-panel"
      >
        {children}
      </div>
    </div>
  );
}
