"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { KIND_LABEL, displayTitle, getDevotional, isReadable } from "@/content";
import { dayOf, monthName, weekday } from "@/lib/dates";
import { useVisits } from "@/lib/path";
import { useToday } from "@/hooks/useToday";
import { PrimaryLink, StoneTag } from "@/components/ui/primitives";
import { Visita } from "@/components/special/Visita";

const ease = [0.22, 0.61, 0.36, 1] as const;

export function Home() {
  const today = useToday();
  const visits = useVisits();
  const params = useSearchParams();

  if (!today) return <div className="flex-1" aria-busy="true" />;

  const d = getDevotional(today.day)!;
  const rehearsal = params.get("ensaio") === "visita";
  if ((d.kind === "visita" && !visits.includes(d.date)) || rehearsal) {
    return <Visita devotional={d} rehearsal={rehearsal} />;
  }

  const n = dayOf(d.date);
  const special = d.kind !== "comum" && d.kind !== "visita";
  const refs = d.word?.reference?.split(/;\s*/) ?? [];

  const rise = (i: number) => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.1, delay: 0.15 + i * 0.14, ease },
  });

  return (
    <section className="relative flex flex-1 flex-col px-6 pb-10 pt-[max(1.75rem,env(safe-area-inset-top))] sm:px-10">
      <header className="flex items-center justify-between">
        <p className="eyebrow text-ink-2">Ao Teu Reino</p>
        {!today.inMonth && <p className="eyebrow text-ink-3">Outubro 2026</p>}
      </header>

      <div className="flex flex-1 flex-col justify-center py-12">
        <motion.div {...rise(0)} className="flex items-end gap-5">
          <span className="font-display text-[5.75rem] leading-[0.8] tracking-[-0.02em] text-ink sm:text-[7rem]">
            {String(n).padStart(2, "0")}
          </span>
          <span className="flex flex-col gap-1.5 pb-1.5">
            <span className="eyebrow text-ink">{monthName(d.date)}</span>
            <span className="eyebrow text-ink-3">{weekday(d.date)}</span>
          </span>
        </motion.div>

        {special && (
          <motion.div {...rise(1)} className="mt-9">
            <StoneTag>{d.label ?? KIND_LABEL[d.kind]}</StoneTag>
          </motion.div>
        )}

        <motion.h1
          {...rise(2)}
          className={`font-display text-[2.35rem] leading-[1.08] text-ink text-balance sm:text-[3.1rem] ${special ? "mt-6" : "mt-10"}`}
        >
          {displayTitle(d.title) || "O devocional de hoje está sendo preparado."}
        </motion.h1>

        {refs.length > 0 && (
          <motion.div {...rise(3)} className="mt-8 flex items-center gap-4">
            <span aria-hidden className="h-px w-8 bg-line-strong" />
            <p className="text-[0.9375rem] text-ink-2">
              <span className="sr-only">Passagem: </span>
              {refs.join(" · ")}
            </p>
          </motion.div>
        )}

        {isReadable(d) && (
          <motion.div {...rise(4)} className="mt-14">
            <PrimaryLink href={`/dia/${n}`} aria-label={`Começar: ${displayTitle(d.title)}`}>
              Começar
              <ArrowRight size={16} strokeWidth={1.5} className="transition-transform duration-700 group-hover:translate-x-1" />
            </PrimaryLink>
          </motion.div>
        )}
      </div>

      <motion.footer {...rise(6)} className="flex items-center justify-between border-t border-line pt-5">
        <Link href="/palavra" className="group flex min-h-11 items-center gap-3 text-ink-2 transition-colors hover:text-ink">
          <span className="eyebrow text-[0.625rem] text-ink-3">Palavra</span>
          <span className="text-[0.875rem]">Uma passagem para hoje</span>
        </Link>
        <ArrowRight size={14} strokeWidth={1.5} className="text-ink-3" aria-hidden />
      </motion.footer>
    </section>
  );
}
