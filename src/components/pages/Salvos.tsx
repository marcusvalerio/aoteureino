"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { removeSaved, useSaved, type SavedKind } from "@/lib/saved";
import { useHydrated } from "@/lib/storage";

const ease = [0.22, 0.61, 0.36, 1] as const;

const FILTERS: { id: SavedKind | "tudo"; label: string }[] = [
  { id: "tudo", label: "Tudo" },
  { id: "devocional", label: "Devocionais" },
  { id: "frase", label: "Frases" },
  { id: "passagem", label: "Passagens" },
];

const KIND: Record<SavedKind, string> = { devocional: "Devocional", frase: "Frase", passagem: "Passagem" };

export function Salvos() {
  const hydrated = useHydrated();
  const items = useSaved();
  const [filter, setFilter] = useState<SavedKind | "tudo">("tudo");
  const shown = filter === "tudo" ? items : items.filter((i) => i.kind === filter);

  return (
    <section className="flex flex-1 flex-col px-6 sm:px-10">
      <header className="pb-8 pt-[max(2rem,calc(env(safe-area-inset-top)+1rem))]">
        <p className="eyebrow text-accent">Salvos</p>
        <h1 className="font-display mt-4 text-[2.4rem] leading-[1.05] text-ink">O que ficou com você</h1>
      </header>

      {hydrated && items.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-x-2.5 sm:gap-x-6" role="tablist" aria-label="Filtrar salvos">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`eyebrow min-h-11 whitespace-nowrap tracking-[0.08em]! sm:tracking-[0.16em]! transition-colors duration-300 ${
                filter === f.id ? "text-ink underline decoration-accent decoration-1 underline-offset-[10px]" : "text-ink-3 hover:text-ink-2"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {hydrated && shown.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease }}
          className="flex flex-1 flex-col items-start justify-center pb-24"
        >
          <span aria-hidden className="stone stone-mark inline-block opacity-80" />
          <p className="font-display mt-8 text-[1.5rem] leading-snug text-ink">
            {items.length === 0 ? "Nada guardado ainda." : "Nada guardado nesta categoria."}
          </p>
          <p className="mt-3 max-w-xs text-[0.9375rem] leading-relaxed text-ink-2">
            Ao ler, toque no marcador para guardar um devocional, uma frase ou a referência de uma passagem. Tudo fica só neste aparelho.
          </p>
        </motion.div>
      )}

      <ul className="pb-12">
        <AnimatePresence initial={false}>
          {shown.map((item) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease }}
              className="overflow-hidden border-t border-line"
            >
              <div className="flex gap-3 py-6">
                <Link href={item.href} className="min-w-0 flex-1">
                  <p className="eyebrow text-[0.5625rem] text-ink-3">{KIND[item.kind]}</p>
                  {item.kind !== "frase" ? (
                    <p className="font-display mt-2 text-[1.35rem] leading-snug text-ink">{item.title}</p>
                  ) : (
                    <>
                      <p className="font-display mt-2 text-[1.3rem] leading-snug text-ink">“{item.text}”</p>
                      <p className="mt-2 text-[0.8125rem] text-ink-3">{item.title}</p>
                    </>
                  )}
                  {item.kind === "devocional" && item.reference && <p className="mt-1.5 text-[0.8125rem] text-ink-3">{item.reference}</p>}
                  {item.kind === "passagem" && <p className="mt-1.5 text-[0.8125rem] text-ink-3">Para ler na sua Bíblia</p>}
                </Link>
                <button
                  type="button"
                  onClick={() => removeSaved(item.id)}
                  aria-label={`Remover: ${item.title}`}
                  className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-line hover:text-ink"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
