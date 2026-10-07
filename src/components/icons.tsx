/**
 * Tujuh ikon, digambar di sini dan bukan diimpor dari satu pustaka, karena
 * tampilan seragam pustaka default itu sendiri adalah penandanya (design.md 8.6).
 * Semuanya stroke 1.75 dengan ujung dipotong rata, menyamakan karakternya
 * dengan terminal huruf Plus Jakarta Sans.
 */

interface IconProps {
  className?: string;
}

const base = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "butt" as const,
  strokeLinejoin: "miter" as const,
  "aria-hidden": true,
  focusable: false as const,
};

export function IconPlay({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M8 5.5 19 12 8 18.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconStop({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="7.5" y="7.5" width="9" height="9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSkip({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 5.5 15 12 6 18.5Z" fill="currentColor" stroke="none" />
      <path d="M18 5.5v13" />
    </svg>
  );
}

export function IconVolume({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4Z" />
      <path d="M15.5 9.25A4 4 0 0 1 15.5 14.75" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconCorrect({ className }: IconProps) {
  return (
    <svg {...base} className={className} strokeWidth={2.25}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

/** Tebalnya dibedakan dari IconClose supaya "salah" tidak terbaca "tutup". */
export function IconWrong({ className }: IconProps) {
  return (
    <svg {...base} className={className} strokeWidth={2.75}>
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  );
}
