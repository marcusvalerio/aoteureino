"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { KIND_LABEL, allDevotionals, displayTitle } from "@/content";
import { dayOf, isFuture, weekdayShort } from "@/lib/dates";
import { usePath, useVisits } from "@/lib/path";
import { useSettings } from "@/lib/settings";
import { useToday } from "@/hooks/useToday";

const ease = [0.22, 0.61, 0.36, 1] as const;

/**
 * JORNADA — o mês como um caminho.
 * Os dias lidos ficam marcados com uma pedra. Não há contagem, porcentagem,
 * sequência ou dia "perdido".
 */
export function Jornada() {
  const today = useToday();
  const walked = usePath();
  const visits = useVisits();
  const { readAhead } = useSettings();
  const days = allDevotionals();

  return (
    <section className="flex flex-1 flex-col px-6 sm:px-10">
      <header className="pb-10 pt-[max(2rem,calc(env(safe-area-inset-top)+1rem))]">
        <p className="eyebrow text-accent">Jornada</p>
        <h1 className="font-display mt-4 text-[2.4rem] leading-[1.05] text-ink sm:text-[3rem]">
          Outubro <span className="text-ink-3">2026</span>
        </h1>
        <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-ink-2">
          Cada dia lido até o fim deixa uma pedra no caminho.
        </p>
      </header>

      <ol className="relative pb-12" aria-label="Dias de outubro">
        <span aria-hidden className="absolute bottom-12 left-[1.1875rem] top-3 w-px bg-line" />
        {days.map((d, i) => {
          const n = dayOf(d.date);
          const isToday = today?.day === n && today.inMonth;
          const future = today ? isFuture(n) : false;
          const open = !future || readAhead;
          const done = walked.includes(d.date);
          // A visita só aparece na jornada depois de vivida.
          const kind = d.kind === "visita" ? (visits.includes(d.date) ? "visita" : "comum") : d.kind;
          const tag = kind === "visita" ? "Visita" : kind !== "comum" ? (d.label ?? KIND_LABEL[kind]) : null;
          const showTitle = open && !(d.kind === "visita" && future);
          const special = kind !== "comum";

          const row = (
            <>
              <span className="relative z-10 flex w-[2.375rem] shrink-0 justify-center pt-[0.7rem]" aria-hidden>
                {isToday && (
                  <span className="absolute top-[0.2rem] h-8 w-8 rounded-full" style={{ background: "radial-gradient(closest-side, var(--glow), transparent)" }} />
                )}
                <span
                  className={`block transition-all duration-700 ${
                    done
                      ? `stone ${special ? "h-[13px] w-[22px]" : "h-[10px] w-[16px]"} rounded-[45%_55%_40%_60%/60%_50%_50%_40%]`
                      : isToday
                        ? "h-[9px] w-[9px] rounded-full bg-accent"
                        : `h-[9px] w-[9px] rounded-full border ${future ? "border-line" : "border-line-strong"} bg-bg`
                  }`}
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5 border-b border-line pb-5 pt-2">
                <span className="flex items-baseline gap-3">
                  <span className={`font-display text-[1.5rem] leading-none ${future ? "text-ink-3" : "text-ink"}`}>{String(n).padStart(2, "0")}</span>
                  <span className="eyebrow text-[0.625rem] text-ink-3">{weekdayShort(d.date)}</span>
                  {isToday && <span className="eyebrow text-[0.625rem] text-accent">Hoje</span>}
                  {tag && <span className="eyebrow ml-auto truncate pl-2 text-[0.5625rem] tracking-[0.18em] text-accent">{tag}</span>}
                </span>
                {showTitle && (
                  <span className={`text-[0.9375rem] leading-snug ${future ? "text-ink-3" : "text-ink-2"}`}>{displayTitle(d.title)}</span>
                )}
              </span>
            </>
          );

          return (
            <motion.li
              key={d.date}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: Math.min(i, 12) * 0.03, ease }}
            >
              {open ? (
                <Link
                  href={`/dia/${n}`}
                  className="flex gap-4 rounded-sm transition-colors duration-300 hover:bg-line/40"
                  aria-label={`${n} de outubro${showTitle ? `: ${displayTitle(d.title)}` : ""}${done ? " — lido" : ""}${isToday ? " — hoje" : ""}`}
                  aria-current={isToday ? "date" : undefined}
                >
                  {row}
                </Link>
              ) : (
                <div className="flex gap-4" aria-label={`${n} de outubro — ainda não chegou`}>
                  {row}
                </div>
              )}
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
