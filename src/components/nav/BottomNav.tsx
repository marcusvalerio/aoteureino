"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

const ITEMS = [
  { href: "/", label: "Início" },
  { href: "/palavra", label: "Palavra" },
  { href: "/jornada", label: "Jornada" },
  { href: "/salvos", label: "Salvos" },
  { href: "/mais", label: "Mais" },
] as const;

function isActive(path: string, href: string) {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(href + "/");
}

export function BottomNav() {
  const path = usePathname();
  // A leitura do devocional é imersiva: sem navegação fixa.
  if (path.startsWith("/dia/")) return null;

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/92 pb-safe backdrop-blur-md"
    >
      <ul className="mx-auto grid max-w-[44rem] grid-cols-5">
        {ITEMS.map((item) => {
          const active = isActive(path, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`eyebrow relative flex h-[4.25rem] flex-col items-center justify-center gap-2 text-[0.625rem] tracking-[0.16em] transition-colors duration-500 ${
                  active ? "text-ink" : "text-ink-3 hover:text-ink-2"
                }`}
              >
                <span className="relative flex h-1.5 w-5 items-center justify-center" aria-hidden>
                  {active && (
                    <motion.span
                      layoutId="nav-light"
                      className="light-point block h-[5px] w-[5px]"
                      transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                    />
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
