"use client";

import { motion } from "motion/react";
import { palavraFor, passageText } from "@/content";
import { useSettings } from "@/lib/settings";
import { useToday } from "@/hooks/useToday";
import { SaveButton } from "@/components/ui/SaveButton";
import { StoneMark } from "@/components/ui/primitives";

const ease = [0.22, 0.61, 0.36, 1] as const;

/**
 * PALAVRA — abrir, ler, permanecer, sair.
 * Sem comentário, sem oração automática, sem frase motivacional.
 */
export function Palavra() {
  const today = useToday();
  const { verseNumbers } = useSettings();
  if (!today) return <div className="flex-1" aria-busy="true" />;
  const p = palavraFor(today.day);

  return (
    <section className="flex flex-1 flex-col px-6 sm:px-10">
      <header className="pb-12 pt-[max(2rem,calc(env(safe-area-inset-top)+1rem))]">
        <h1 className="eyebrow text-accent">Palavra</h1>
        <p className="font-display mt-4 text-[1.35rem] leading-snug text-ink-2">Uma passagem para hoje.</p>
      </header>

      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.2, ease }}
        aria-labelledby="ref"
        className="flex flex-1 flex-col"
      >
        <h2 id="ref" className="font-display text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
          {p.reference}
        </h2>
        <span aria-hidden className="mt-8 block h-px w-10 bg-line-strong" />

        <div className="font-display mt-9 space-y-5 text-[calc(1.375rem*var(--reading-scale))] leading-[1.6] text-ink">
          {p.verses.map((v, i) => (
            <motion.p
              key={v.n}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.5 + i * 0.25, ease }}
            >
              {verseNumbers && (
                <sup className="mr-1.5 font-sans text-[0.6875rem] font-medium tracking-wide text-accent">{v.n}</sup>
              )}
              {v.text}
            </motion.p>
          ))}
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-line pb-8 pt-4">
          <StoneMark />
          <SaveButton
            withText
            label="Guardar passagem"
            item={{ id: `passagem:${p.id}`, kind: "passagem", title: p.reference, text: passageText(p), reference: p.reference, href: "/palavra" }}
          />
        </div>
      </motion.article>
    </section>
  );
}
