import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Eyebrow({ children, className = "", as: As = "p" }: { children: ReactNode; className?: string; as?: "p" | "h2" | "span" | "h3" }) {
  return <As className={`eyebrow text-accent ${className}`}>{children}</As>;
}

/** Uma pequena curva de luz — o separador do sistema. */
export function LightMark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden width="30" height="9" viewBox="0 0 30 9" fill="none" className={className}>
      <path d="M1 8C8 1.5 22 1.5 29 8" stroke="var(--light)" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center gap-4 ${className}`}>
      <span className="h-px flex-1 bg-line" />
      <LightMark />
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function IconButton({ label, children, className = "", ...rest }: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-2 transition-colors duration-300 hover:bg-line hover:text-ink ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Rótulo raro (Encontro, datas especiais): um ponto de luz e uma palavra. */
export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`tag eyebrow text-[0.625rem] ${className}`}>{children}</span>;
}

export function PrimaryLink({ children, className = "", ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={`eyebrow group inline-flex min-h-14 items-center justify-center gap-4 rounded-full bg-[var(--cta)] px-9 text-[0.6875rem] tracking-[0.3em] text-[var(--cta-ink)] shadow-[var(--shadow)] transition-[box-shadow,transform] duration-700 hover:shadow-[0_0_0_6px_var(--glow),var(--shadow)] ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
