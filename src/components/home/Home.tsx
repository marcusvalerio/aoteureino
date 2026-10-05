"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { KIND_LABEL, displayTitle, getDevotional, isReadable } from "@/content";
import { dayOf, monthName, weekday } from "@/lib/dates";
import { useVisits } from "@/lib/path";
import { useToday } from "@/hooks/useToday";
import { PrimaryLink, Tag } from "@/components/ui/primitives";
import { useEntered } from "@/lib/entered";
import { Visita } from "@/components/special/Visita";

const ease = [0.22, 0.61, 0.36, 1] as const;

export function Home() {
  const today = useToday();
  const visits = useVisits();
  const params = useSearchParams();
  const entered = useEntered();

  if (!today) return <div className="flex-1" aria-busy="true" />;

  const d = getDevotional(today.day)!;
  const rehearsal = params.get("ensaio") === "visita";
  if ((d.kind === "visita" && !visits.includes(d.date)) || rehearsal) {
    return <Visita devotional={d} rehearsal={rehearsal} />;
  }

  const n = dayOf(d.date);
  const special = d.kind !== "comum" && d.kind !== "visita";
  const refs = d.word?.reference?.split(/;\s*/) ?? [];

  // A Home nasce da luz da abertura: cada elemento é revelado em sequência.
  const rise = (i: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    transition: { duration: 1.2, delay: 0.1 + i * 0.13, ease },
  });

  return (
    <section className="relative flex flex-1 flex-col px-6 pb-10 pt-[max(1.75rem,env(safe-area-inset-top))] sm:px-10">
      <header className="flex items-center justify-between">
        <p data-wordmark className="font-display text-[1.25rem] leading-none tracking-[0.04em] text-ink">
          AO TEU REINO
        </p>
        {!today.inMonth && <p className="eyebrow text-ink-3">Outubro 2026</p>}
      </header>

      <div className="flex flex-1 flex-col justify-center py-12">
        <motion.div {...rise(0)} className="flex items-end gap-5">
          <span className="font-display text-[7.5rem] leading-[0.72] tracking-[-0.03em] text-ink sm:text-[9rem]">
            {String(n).padStart(2, "0")}
          </span>
          <span className="flex flex-col gap-1.5 pb-1">
            <span className="eyebrow text-ink">{monthName(d.date)}</span>
            <span className="eyebrow text-ink-3">{weekday(d.date)}</span>
          </span>
        </motion.div>

        {special && (
          <motion.div {...rise(1)} className="mt-10">
            <Tag>{d.label ?? KIND_LABEL[d.kind]}</Tag>
          </motion.div>
        )}

        <motion.h1
          {...rise(2)}
          className={`font-display text-[2.9rem] leading-[1.02] text-ink text-balance sm:text-[3.75rem] ${special ? "mt-5" : "mt-10"}`}
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

      <motion.footer {...rise(6)}>
        <Link
          href="/palavra"
          className="paper group flex min-h-16 items-center justify-between gap-4 px-5 py-4 text-ink-2 transition-colors hover:text-ink"
        >
          <span className="flex flex-col gap-1">
            <span className="eyebrow text-[0.625rem] text-accent">Palavra</span>
            <span className="font-display text-[1.2rem] leading-tight text-ink">Uma passagem para hoje</span>
          </span>
          <ArrowRight size={16} strokeWidth={1.5} className="shrink-0 transition-transform duration-700 group-hover:translate-x-1" aria-hidden />
        </Link>
      </motion.footer>
    </section>
  );
}
