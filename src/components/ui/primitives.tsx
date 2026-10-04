import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Eyebrow({ children, className = "", as: As = "p" }: { children: ReactNode; className?: string; as?: "p" | "h2" | "span" | "h3" }) {
  return <As className={`eyebrow text-accent ${className}`}>{children}</As>;
}

/** Uma pequena pedra entre seções. */
export function StoneMark({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`stone stone-mark inline-block ${className}`} />;
}

export function Divider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center gap-4 ${className}`}>
      <span className="h-px flex-1 bg-line" />
      <StoneMark />
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

/** Rótulo gravado num pequeno fragmento de pedra — só para dias especiais. */
export function StoneTag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`stone fragment inline-flex items-center px-3.5 py-1.5 ${className}`}>
      <span className="eyebrow engraved text-[0.625rem] tracking-[0.24em]">{children}</span>
    </span>
  );
}

export function PrimaryLink({ children, className = "", ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={`eyebrow group inline-flex min-h-14 items-center justify-center gap-4 bg-ink px-9 text-[0.75rem] tracking-[0.34em] text-bg transition-[background-color,box-shadow] duration-700 hover:shadow-[0_0_0_6px_var(--glow)] ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
