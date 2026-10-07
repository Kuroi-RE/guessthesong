"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet" | "chip";

/**
 * Varian tombol dari design.md 8.1. Isian penuh dipakai maksimal satu per zona,
 * dan chip memakai radius tegas karena ia mengubah keadaan sementara tombol
 * menjalankan tindakan: bentuknya yang memisahkan dua peran itu.
 *
 * Semua varian memenuhi target sentuh 44px lewat min-h, termasuk chip yang
 * tinggi visualnya lebih kecil (design.md 7.6).
 */
const VARIANT: Record<Variant, string> = {
  primary:
    "on-brand bg-brand text-on-brand border border-brand font-semibold hover:bg-kaset-700 hover:text-ink-50 hover:border-kaset-700 active:translate-y-px",
  secondary:
    "bg-transparent text-text border border-line-strong hover:border-brand hover:text-brand-text active:translate-y-px",
  quiet:
    "bg-transparent text-muted border border-transparent hover:text-text hover:border-line active:translate-y-px",
  chip: "bg-transparent text-muted border border-line hover:border-line-strong hover:text-text",
};

const SHAPE: Record<Variant, string> = {
  primary: "rounded-control px-4 min-h-11",
  secondary: "rounded-control px-4 min-h-11",
  quiet: "rounded-control px-3 min-h-11",
  chip: "rounded-sharp px-3 min-h-11",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Dipakai chip filter: menandai pilihan yang sedang aktif. */
  selected?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "secondary",
  selected = false,
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const selectedClass =
    selected && variant === "chip"
      ? "bg-brand-deep text-ink-50 border-brand-deep"
      : "";

  return (
    <button
      type={type}
      aria-pressed={variant === "chip" ? selected : undefined}
      className={`inline-flex items-center justify-center gap-2 text-ui transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55 ${VARIANT[variant]} ${SHAPE[variant]} ${selectedClass} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Label kelompok di dalam drawer. Ini satu-satunya tempat huruf besar dipakai,
 * dan trackingnya kecil, bukan lebar ekstrem (design.md 4.1).
 */
export function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-muted">
      {children}
    </h3>
  );
}

/** Pembatas bagian yang memakai motif tangga, dipakai sekali per halaman. */
export function LadderRule() {
  return (
    <div className="flex items-end gap-1" aria-hidden="true">
      {[0.32, 0.71, 1.41, 2.83, 3.87].map((weight, index) => (
        <span
          key={weight}
          style={{ flexGrow: weight }}
          className={`h-0.5 rounded-sharp ${index === 4 ? "bg-ladder-fill" : "bg-ladder-idle"}`}
        />
      ))}
    </div>
  );
}
