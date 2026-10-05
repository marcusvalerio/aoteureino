"use client";

/**
 * A VISITA — uma interrupção da rotina.
 *
 * Experiência escondida: só acontece no próprio dia marcado pela editoria
 * (kind "visita") e nunca é anunciada antes. A interface some, o ritmo
 * muda, o texto chega um trecho de cada vez, com luz e silêncio.
 *
 * Linguagem editorial: não afirma aparições, nem que Deus enviou algo pelo
 * aplicativo. Só abre espaço.
 *
 * Ritmo: a interface clareia e escurece devagar, uma fresta de luz se abre,
 * o título chega sozinho, e o texto vem um trecho por vez. Nenhum rótulo
 * anuncia a experiência — nem antes, nem durante, nem depois.
 *
 * Ensaio para revisão: /?ensaio=visita (usa o devocional do dia, não registra).
 */
import { useCalmMotion } from "@/hooks/useReducedMotion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { LightField, type LightFieldHandle } from "@/components/light/LightField";
import { VISITA } from "@/components/light/presets";
import { displayTitle, type Devotional } from "@/content";
import { dayOf } from "@/lib/dates";
import { markVisited } from "@/lib/path";

const ease = [0.22, 0.61, 0.36, 1] as const;

interface Step {
  label?: string;
  text: string;
  note?: string;
  pause?: boolean;
  display?: boolean;
  /** Silêncio antes de permitir continuar (ms). */
  hold?: number;
}

function stepsFor(d: Devotional): Step[] {
  const s: Step[] = [];
  if (d.word?.reference)
    s.push({
      label: "A Palavra",
      text: d.word.reference.split(/;\s*/).join("\n"),
      note: d.word.text.length ? d.word.text.join("\n") : "Leia esta passagem diretamente na sua Bíblia.",
      display: true,
      hold: 3000,
    });
  d.reflection.forEach((p, i) => s.push({ label: i === 0 ? "Reflexão" : undefined, text: p, hold: 2200 }));
  d.pause.forEach((p, i) => s.push({ label: i === 0 ? "Pare aqui" : undefined, text: p, display: true, pause: true, hold: 8000 }));
  if (d.prayer.length) s.push({ label: "Ore", text: d.prayer.join("\n\n"), display: true, hold: 3000 });
  if (d.practice.length) s.push({ label: "Viva isso hoje", text: d.practice.join("\n\n") });
  if (d.closingPhrase) s.push({ label: "Para levar com você", text: d.closingPhrase, display: true, hold: 3500 });
  return s;
}

export function Visita({ devotional, rehearsal = false }: { devotional: Devotional; rehearsal?: boolean }) {
  const router = useRouter();
  const steps = useMemo(() => stepsFor(devotional), [devotional]);
  // -1: a luz chegando · 0..n-1: trechos · n: fim
  const [i, setI] = useState(-1);
  const [ready, setReady] = useState(false);
  const reduced = useCalmMotion();
  const field = useRef<LightFieldHandle>(null);
  useEffect(() => {
    // ondas muito lentas: uma pausa, não um espetáculo
    field.current?.setSpeed(0.3);
  }, []);

  const step = i >= 0 && i < steps.length ? steps[i] : null;
  const end = i >= steps.length;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cada trecho pede seu próprio tempo de silêncio
    setReady(false);
    const hold = i === -1 ? 4800 : (step?.hold ?? 1600);
    const t = setTimeout(() => setReady(true), hold);
    return () => clearTimeout(t);
  }, [i, step]);

  const leave = useCallback(() => {
    if (!rehearsal) markVisited(devotional.date);
    router.push(rehearsal ? "/" : `/dia/${dayOf(devotional.date)}`);
  }, [rehearsal, devotional.date, router]);

  const next = useCallback(() => {
    if (!ready) return;
    if (end) return leave();
    setI((v) => v + 1);
  }, [ready, end, leave]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") leave();
      else if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, leave]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#0a110f] text-[#f2eee8]" role="region" aria-label="Uma pausa diferente">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: end ? 0.25 : i === -1 ? 0.5 : 0.8 }}
        transition={{ duration: 4, ease }}
      >
        <LightField ref={field} bands={VISITA} live={!reduced} seed={23} className="absolute inset-0" />
      </motion.div>
      {/* A fresta de luz */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-full -translate-x-1/2"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgb(243 214 160 / 0.55) 30%, rgb(255 240 210 / 0.9) 52%, rgb(243 214 160 / 0.45) 75%, transparent 100%)",
          maskImage: "linear-gradient(to right, transparent, #000 42%, #000 58%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 42%, #000 58%, transparent)",
        }}
        initial={{ width: 1, opacity: 0, scaleY: 0 }}
        animate={
          i === -1
            ? { width: ["1px", "2px", "min(70vw, 26rem)"], opacity: [0, 1, 0.1], scaleY: [0, 1, 1] }
            : { width: step?.pause ? "min(96vw, 40rem)" : "min(86vw, 34rem)", opacity: step?.pause ? 0.13 : 0.07, scaleY: 1 }
        }
        transition={i === -1 ? { duration: 4.4, times: [0, 0.45, 1], ease } : { duration: 2.4, ease }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 50% at 50% 48%, rgb(243 205 140 / 0.16), transparent 70%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: i === -1 ? 0.6 : step?.pause ? 1 : 0.75, scale: step?.pause ? 1.08 : 1 }}
        transition={{ duration: step?.pause ? 6 : 3, ease }}
      />

      <button
        type="button"
        onClick={next}
        className="relative flex flex-1 flex-col items-center justify-center px-8 text-center outline-none"
        aria-label={ready ? (end ? "Concluir" : "Continuar") : "Aguarde"}
      >
        <AnimatePresence mode="wait">
          {i === -1 && (
            <motion.p
              key="title"
              className="font-display max-w-md text-[2.4rem] leading-[1.08] text-balance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.9 } }}
              transition={{ duration: 2, delay: 2.8, ease }}
            >
              {displayTitle(devotional.title)}
            </motion.p>
          )}
          {step && (
            <motion.div
              key={i}
              className="max-w-xl"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.7 } }}
              transition={{ duration: 1.4, ease }}
              aria-live="polite"
            >
              {step.label && <p className="eyebrow mb-8 text-[#e1b270]">{step.label}</p>}
              <p
                className={`whitespace-pre-line text-balance ${
                  step.display
                    ? "font-display text-[calc(2rem*var(--reading-scale))] leading-[1.18]"
                    : "reading text-[#e3ddd3]"
                }`}
              >
                {step.text}
              </p>
              {step.note && <p className="mt-8 text-[0.9375rem] leading-relaxed text-[#c9cbc3]">{step.note}</p>}
            </motion.div>
          )}
          {end && (
            <motion.div
              key="end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.6, ease }}
              className="flex flex-col items-center gap-6"
            >
              <span aria-hidden className="light-point inline-block h-2.5 w-2.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <div className="relative flex h-24 items-center justify-center pb-safe">
        <motion.span
          className="eyebrow text-[0.625rem] text-[#c9cbc3]"
          animate={{ opacity: ready ? 0.8 : 0 }}
          transition={{ duration: 1.2, ease }}
          aria-hidden
        >
          {end ? "Tocar para voltar" : "Tocar para continuar"}
        </motion.span>
      </div>
      {/* A interface comum se apaga devagar: a ruptura é delicada */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--bg)" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.8, ease }}
      />
      {i >= 0 && !end && (
        <motion.button
          type="button"
          onClick={leave}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease }}
          className="eyebrow absolute right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))] min-h-11 px-3 text-[0.625rem] text-[#c9cbc3]/55 transition-colors hover:text-[#c9cbc3]"
        >
          Ler na página
        </motion.button>
      )}
      {rehearsal && (
        <p className="eyebrow absolute left-4 top-[max(1rem,env(safe-area-inset-top))] text-[0.625rem] text-[#c9cbc3]/50">Ensaio</p>
      )}
    </div>
  );
}
