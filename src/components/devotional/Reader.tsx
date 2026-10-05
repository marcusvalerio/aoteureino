"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Share } from "lucide-react";
import { motion, useInView, useReducedMotionConfig } from "motion/react";
import { KIND_LABEL, displayTitle, getDevotional, type Devotional } from "@/content";
import { DAYS_IN_MONTH, isFuture, monthName, weekday } from "@/lib/dates";
import { markWalked, useVisits } from "@/lib/path";
import { useSettings } from "@/lib/settings";
import { useToday } from "@/hooks/useToday";
import { Divider, Eyebrow, IconButton, StoneTag } from "@/components/ui/primitives";
import { SaveButton } from "@/components/ui/SaveButton";
import { ShareSheet } from "@/components/share/ShareSheet";
import { Visita } from "@/components/special/Visita";

const ease = [0.22, 0.61, 0.36, 1] as const;

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotionConfig();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1, ease }}
    >
      {children}
    </motion.div>
  );
}

function Paragraphs({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <div className={`space-y-[1.15em] ${className}`}>
      {items.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}

export function Reader({ day }: { day: number }) {
  const today = useToday();
  const settings = useSettings();
  const visits = useVisits();
  const d = getDevotional(day)!;

  if (!today) return <div className="min-h-dvh" aria-busy="true" />;

  const locked = isFuture(day) && !settings.readAhead;
  if (locked) return <NotYet devotional={d} day={day} />;

  // A visita acontece uma vez: no próprio dia ou na primeira vez que o dia for aberto depois dele.
  if (d.kind === "visita" && !isFuture(day) && !visits.includes(d.date)) {
    return <Visita devotional={d} />;
  }

  return <Devotional devotional={d} day={day} />;
}

function TopBar({ day, title, onShare, canShare, devotional }: { day: number; title: string; onShare: () => void; canShare: boolean; devotional: Devotional }) {
  return (
    <div className="sticky top-0 z-30 -mx-6 flex items-center justify-between border-b border-transparent bg-bg/90 px-3 pt-safe backdrop-blur-md sm:-mx-10">
      <Link href="/" aria-label="Voltar ao início" className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-line hover:text-ink">
        <ArrowLeft size={19} strokeWidth={1.5} />
      </Link>
      <p className="eyebrow text-[0.625rem] text-ink-3" aria-hidden>
        {String(day).padStart(2, "0")} · {monthName(devotional.date)}
      </p>
      <div className="flex items-center">
        <SaveButton
          label="Guardar devocional"
          item={{ id: `devocional:${devotional.date}`, kind: "devocional", title, reference: devotional.reference ?? undefined, href: `/dia/${day}` }}
        />
        {canShare && (
          <IconButton label="Compartilhar uma reflexão" onClick={onShare}>
            <Share size={18} strokeWidth={1.5} />
          </IconButton>
        )}
      </div>
    </div>
  );
}

function Devotional({ devotional: d, day }: { devotional: Devotional; day: number }) {
  const [share, setShare] = useState(false);
  const title = displayTitle(d.title);
  const endRef = useRef<HTMLDivElement>(null);
  const reachedEnd = useInView(endRef, { once: true, amount: 0.6 });
  const special = d.kind !== "comum" && d.kind !== "visita";
  const refs = d.word?.reference?.split(/;\s*/) ?? [];
  const canShare = Boolean(d.shareQuestion || d.closingPhrase);

  useEffect(() => {
    if (reachedEnd) markWalked(d.date);
  }, [reachedEnd, d.date]);

  return (
    <article className="flex flex-1 flex-col px-6 sm:px-10" aria-labelledby="titulo">
      <TopBar day={day} title={title} onShare={() => setShare(true)} canShare={canShare} devotional={d} />

      <header className="pb-14 pt-10">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease }} className="eyebrow text-ink-3">
          {weekday(d.date)}, {day} de {monthName(d.date).toLowerCase()}
        </motion.p>
        {special && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.1, ease }} className="mt-6">
            <StoneTag>{d.label ?? KIND_LABEL[d.kind]}</StoneTag>
          </motion.div>
        )}
        <motion.h1
          id="titulo"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease }}
          className="font-display mt-6 text-[2.15rem] leading-[1.1] text-ink text-balance sm:text-[2.75rem]"
        >
          {title}
        </motion.h1>
      </header>

      {refs.length > 0 && (
        <Reveal className="mb-16">
          <section aria-labelledby="s-palavra">
            <Eyebrow as="h2">
              <span id="s-palavra">A Palavra</span>
            </Eyebrow>
            <div className="mt-5 space-y-1">
              {refs.map((r) => (
                <p key={r} className="font-display text-[1.6rem] leading-snug text-ink">
                  {r}
                </p>
              ))}
            </div>
            {d.word && d.word.text.length > 0 ? (
              <Paragraphs items={d.word.text} className="reading-display font-display mt-6 text-ink-2" />
            ) : (
              <p className="mt-4 text-[0.875rem] text-ink-3">Leia esta passagem diretamente na sua Bíblia antes de seguir.</p>
            )}
          </section>
        </Reveal>
      )}

      {d.reflection.length > 0 && (
        <Reveal className="mb-16">
          <section aria-labelledby="s-reflexao">
            <Eyebrow as="h2" className="mb-6">
              <span id="s-reflexao">Reflexão</span>
            </Eyebrow>
            <Paragraphs items={d.reflection} className="reading text-ink" />
          </section>
        </Reveal>
      )}

      {d.pause.length > 0 && (
        <Reveal className="-mx-6 mb-16 sm:mx-0">
          <section aria-labelledby="s-pare" className="stone-basalt fragment px-8 py-16 text-center sm:px-14">
            <h2 id="s-pare" className="eyebrow engraved text-[0.6875rem]">
              Pare aqui
            </h2>
            <span aria-hidden className="mx-auto mt-6 block h-8 w-px bg-[#e9e2d5]/25" />
            <Paragraphs items={d.pause} className="font-display reading-display mt-6 text-[#efe7d9] text-balance" />
          </section>
        </Reveal>
      )}

      {d.prayer.length > 0 && (
        <Reveal className="mb-16">
          <section aria-labelledby="s-ore">
            <Eyebrow as="h2" className="mb-6">
              <span id="s-ore">Ore</span>
            </Eyebrow>
            <Paragraphs items={d.prayer} className="font-display reading-display text-ink" />
          </section>
        </Reveal>
      )}

      {d.practice.length > 0 && (
        <Reveal className="mb-16">
          <section aria-labelledby="s-viva" className="border-l border-accent/60 pl-6">
            <Eyebrow as="h2" className="mb-4">
              <span id="s-viva">Viva isso hoje</span>
            </Eyebrow>
            <Paragraphs items={d.practice} className="reading text-ink" />
          </section>
        </Reveal>
      )}

      {d.closingPhrase && (
        <Reveal className="mb-14">
          <section aria-labelledby="s-levar" className="py-10 text-center">
            <div ref={endRef}>
              <Eyebrow as="h2">
                <span id="s-levar">Para levar com você</span>
              </Eyebrow>
              <p className="font-display mx-auto mt-7 max-w-[30rem] text-[calc(1.75rem*var(--reading-scale))] leading-[1.25] text-ink text-balance">
                {d.closingPhrase}
              </p>
              <div className="mt-8 flex items-center justify-center gap-1">
                <SaveButton
                  withText
                  label="Guardar frase"
                  item={{ id: `frase:${d.date}`, kind: "frase", title, text: d.closingPhrase, reference: d.reference ?? undefined, href: `/dia/${day}` }}
                />
                {canShare && (
                  <button
                    type="button"
                    onClick={() => setShare(true)}
                    className="inline-flex min-h-11 items-center gap-2.5 rounded-full px-3 text-ink-2 transition-colors hover:text-ink"
                  >
                    <Share size={18} strokeWidth={1.5} />
                    <span className="eyebrow text-[0.625rem]">Compartilhar</span>
                  </button>
                )}
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {d.reference && (
        <section aria-labelledby="s-ref" className="mb-12">
          <Divider className="mb-8" />
          <p id="s-ref" className="eyebrow text-[0.625rem] text-ink-3">
            Referência
          </p>
          <p className="mt-2 text-[0.9375rem] text-ink-2">{d.reference}</p>
        </section>
      )}

      <DayNav day={day} />

      <ShareSheet
        open={share}
        onClose={() => setShare(false)}
        title={title}
        question={d.shareQuestion}
        phrase={d.closingPhrase}
        reference={d.word?.reference}
      />
    </article>
  );
}

function DayNav({ day }: { day: number }) {
  const settings = useSettings();
  const prev = day > 1 ? day - 1 : null;
  const next = day < DAYS_IN_MONTH ? day + 1 : null;
  const nextOpen = next !== null && (!isFuture(next) || settings.readAhead);
  return (
    <nav aria-label="Outros dias" className="mt-auto grid grid-cols-2 border-t border-line pb-[max(2rem,env(safe-area-inset-bottom))]">
      {prev ? (
        <Link href={`/dia/${prev}`} className="group flex min-h-20 flex-col justify-center gap-1.5 pr-4 text-ink-2 hover:text-ink">
          <span className="eyebrow flex items-center gap-2 text-[0.625rem] text-ink-3">
            <ArrowLeft size={13} strokeWidth={1.5} /> Dia {prev}
          </span>
          <span className="line-clamp-2 text-[0.875rem]">{displayTitle(getDevotional(prev)?.title)}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && nextOpen ? (
        <Link href={`/dia/${next}`} className="group flex min-h-20 flex-col items-end justify-center gap-1.5 border-l border-line pl-4 text-right text-ink-2 hover:text-ink">
          <span className="eyebrow flex items-center gap-2 text-[0.625rem] text-ink-3">
            Dia {next} <ArrowRight size={13} strokeWidth={1.5} />
          </span>
          <span className="line-clamp-2 text-[0.875rem]">{displayTitle(getDevotional(next)?.title)}</span>
        </Link>
      ) : (
        <Link href="/jornada" className="flex min-h-20 flex-col items-end justify-center gap-1.5 border-l border-line pl-4 text-right text-ink-3 hover:text-ink-2">
          <span className="eyebrow text-[0.625rem]">Jornada</span>
          <span className="text-[0.875rem]">Ver o mês</span>
        </Link>
      )}
    </nav>
  );
}

function NotYet({ devotional, day }: { devotional: Devotional; day: number }) {
  return (
    <div className="flex min-h-dvh flex-col px-6 pt-safe sm:px-10">
      <div className="flex h-14 items-center">
        <Link href="/jornada" aria-label="Voltar à jornada" className="-ml-3 inline-flex h-12 w-12 items-center justify-center rounded-full text-ink-2 hover:bg-line">
          <ArrowLeft size={19} strokeWidth={1.5} />
        </Link>
      </div>
      <div className="flex flex-1 flex-col items-start justify-center pb-24">
        <span className="font-display text-[5rem] leading-none text-ink-3/60">{String(day).padStart(2, "0")}</span>
        <p className="eyebrow mt-4 text-ink-3">
          {weekday(devotional.date)} · {monthName(devotional.date)}
        </p>
        <h1 className="font-display mt-10 text-[1.9rem] leading-tight text-ink">Este dia ainda não chegou.</h1>
        <p className="mt-4 max-w-sm text-[1rem] leading-relaxed text-ink-2">
          Ele estará aqui em {day} de {monthName(devotional.date).toLowerCase()}. Até lá, fique com o dia de hoje.
        </p>
        <Link href="/" className="eyebrow mt-10 inline-flex min-h-12 items-center gap-3 border-b border-line-strong text-ink">
          Voltar para hoje <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
