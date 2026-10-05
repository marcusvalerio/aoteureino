"use client";

/**
 * A abertura do AO TEU REINO — luz, movimento, Palavra.
 *
 * 1. Quase escuro. Horizontes de luz surgem e respiram devagar.
 * 2. ENTRAR: o toque perturba o campo de luz; ele acelera e se reorganiza.
 * 3. O nome desce, conduzido por uma curva de luz.
 * 4. Tudo desacelera. O nome se define. DEVOCIONAL EVANGÉLICO. ENTRAR.
 * 5. A última onda clareia a tela; o nome encolhe até o cabeçalho e a
 *    interface nasce daquela luz.
 *
 * Alto ↔ baixo, luz ↔ matéria, movimento ↔ permanência: metáfora visual
 * (Mt 6:10), não afirmação teológica. Nada é desenhado de forma literal.
 */
import { useCalmMotion } from "@/hooks/useReducedMotion";
import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion } from "motion/react";
import { KEYS, write } from "@/lib/storage";
import { ENTER_EVENT, announceEntered } from "@/lib/entered";
import { LightField, type LightFieldHandle } from "@/components/light/LightField";
import { OPENING } from "@/components/light/presets";

type Phase = "idle" | "emerge" | "await" | "touch" | "descend" | "settle" | "ready" | "home" | "out" | "done";

const FLOW = [0.45, 0, 0.15, 1] as const;
const CALM = [0.22, 0.61, 0.36, 1] as const;
const LAND = [0.16, 0.84, 0.3, 1] as const;

export const REPLAY_EVENT = "atr:abertura";

const after = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function Opening() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const reduced = useCalmMotion();
  const field = useRef<LightFieldHandle>(null);
  const title = useRef<HTMLDivElement>(null);
  const run = useRef(0);

  const start = useCallback(async () => {
    const id = ++run.current;
    setPhase("emerge");
    await after(reduced ? 900 : 3400);
    if (run.current === id) setPhase("await");
  }, [reduced]);

  useEffect(() => {
    if (document.documentElement.dataset.opening === "full") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- inicia a sequência após a hidratação
      void start();
    }
    const replay = () => {
      document.documentElement.dataset.opening = "full";
      window.dispatchEvent(new Event(ENTER_EVENT));
      window.scrollTo(0, 0);
      if (title.current) title.current.style.transform = "";
      void start();
    };
    window.addEventListener(REPLAY_EVENT, replay);
    return () => window.removeEventListener(REPLAY_EVENT, replay);
  }, [start]);

  /** Primeiro toque: a luz responde e o nome começa a descer. */
  const touch = async (x: number, y: number) => {
    if (phase !== "await") return;
    const id = ++run.current;
    if (reduced) {
      setPhase("settle");
      await after(700);
      if (run.current === id) setPhase("ready");
      return;
    }
    const px = (x / window.innerWidth) * 100;
    const py = (y / window.innerHeight) * 100;
    field.current?.perturb(px, py, 1.2);
    setRipple({ x, y, id });
    setPhase("touch");
    await after(900);
    if (run.current !== id) return;
    setPhase("descend");
    await after(3400);
    if (run.current !== id) return;
    field.current?.setSpeed(0.25);
    setPhase("settle");
    await after(1500);
    if (run.current === id) setPhase("ready");
  };

  /** A interface nasce da luz: o nome vai para o cabeçalho, a última onda clareia tudo. */
  const enterHome = async (quick = false) => {
    const id = ++run.current;
    write(KEYS.opening, "vista");
    setPhase("home");
    field.current?.setSpeed(2.2);

    const target = document.querySelector<HTMLElement>("[data-wordmark]");
    const el = title.current;
    const titleVisible = phase === "ready" || phase === "settle";
    if (!reduced && !quick && el && target && titleVisible) {
      const a = el.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      const s = b.height / a.height;
      void animate(
        el,
        { x: b.left - a.left, y: b.top - a.top, scale: s },
        { duration: 1.5, ease: FLOW },
      );
    }
    await after(reduced || quick ? 450 : 1350);
    if (run.current !== id) return;
    announceEntered("revealing");
    document.documentElement.style.overflow = "";
    setPhase("out");
    await after(reduced ? 300 : 800);
    if (run.current !== id) return;
    announceEntered("done");
    setPhase("done");
  };

  // Esc pula para o aplicativo
  useEffect(() => {
    if (phase === "idle" || phase === "done" || phase === "home" || phase === "out") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && void enterHome(true);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (phase === "done") return null;

  const descending = phase === "descend" || phase === "settle" || phase === "ready" || phase === "home";
  const showTitle = descending;
  const settled = phase === "settle" || phase === "ready" || phase === "home";
  const lit = phase !== "idle";
  const leaving = phase === "home" || phase === "out";
  const lightAmount = phase === "emerge" || phase === "await" ? 0.55 : phase === "touch" ? 0.85 : 1;

  return (
    <div
      id="abertura"
      role="dialog"
      aria-modal="true"
      aria-label="Abertura — AO TEU REINO"
      className={`fixed inset-0 z-[100] overflow-hidden ${phase === "out" ? "pointer-events-none" : ""}`}
      onClick={(e) => phase === "await" && void touch(e.clientX, e.clientY)}
    >
      {/* Noite: o fundo de onde a luz surge */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[#0a110f]"
        initial={false}
        animate={{ opacity: phase === "out" ? 0 : 1 }}
        transition={{ duration: 0.8, ease: CALM }}
      />

      {phase !== "idle" && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "out" ? 0 : lit ? 1 : 0 }}
          transition={{ duration: phase === "emerge" ? 4.6 : 0.8, ease: phase === "emerge" ? [0.55, 0, 0.6, 1] : CALM }}
        >
          <LightField
            ref={field}
            bands={OPENING}
            live={!reduced}
            seed={11}
            className="absolute inset-0"
            lightOpacity={lightAmount}
          />

          {/* O fundo muda gradualmente enquanto o nome desce */}
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "radial-gradient(120% 70% at 50% 0%, rgb(98 65 51 / 0.55), transparent 70%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: descending ? 1 : 0 }}
            transition={{ duration: 3.4, ease: FLOW }}
          />

          {/* Resposta ao toque */}
          {ripple && (
            <motion.span
              key={ripple.id}
              aria-hidden
              className="absolute h-[60vmax] w-[60vmax] rounded-full"
              style={{
                left: ripple.x,
                top: ripple.y,
                x: "-50%",
                y: "-50%",
                background: "radial-gradient(closest-side, transparent 74%, rgb(247 245 243 / 0.5) 82%, rgb(225 178 112 / 0.25) 88%, transparent 100%)",
              }}
              initial={{ scale: 0.05, opacity: 0.9 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 2.2, ease: [0.1, 0.6, 0.3, 1] }}
            />
          )}
          <div aria-hidden className="grain absolute inset-0 opacity-[0.06] mix-blend-overlay" />
        </motion.div>
      )}

      {/* O nome, conduzido pela luz */}
      <div className="pointer-events-none absolute inset-x-0 top-[42%] z-20 flex justify-center px-5">
        <motion.div
          className="relative flex flex-col items-center"
          initial={false}
          animate={
            reduced
              ? { opacity: showTitle ? 1 : 0, y: 0 }
              : { opacity: showTitle ? 1 : 0, y: descending ? 0 : "-62vh" }
          }
          transition={{
            y: { duration: 3.4, ease: LAND },
            opacity: { duration: descending && !reduced ? 1.4 : 0.9, ease: CALM },
          }}
        >
          {/* curva de luz que acompanha a descida */}
          {!reduced && (
            <motion.span
              aria-hidden
              className="absolute left-1/2 top-[calc(-6.5rem-2.5vw)] h-[150vw] w-[230vw] -translate-x-1/2"
              style={{
                background:
                  "radial-gradient(closest-side, transparent 88%, rgb(225 178 112 / 0.22) 93.2%, rgb(247 245 243 / 0.85) 94.2%, rgb(225 178 112 / 0.3) 95.6%, transparent 99%)",
                maskImage: "linear-gradient(to bottom, #000 0%, #000 12%, transparent 30%)",
                WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 12%, transparent 30%)",
              }}
              animate={{ opacity: leaving ? 0 : settled ? 0.55 : 1 }}
              transition={{ duration: 1.6, ease: CALM }}
            />
          )}
          <div
            ref={title}
            className="relative origin-top-left"
            style={{
              color: leaving ? "var(--ink)" : "#f7f5f3",
              transition: "color 1.4s cubic-bezier(0.45, 0, 0.15, 1)",
            }}
          >
            <h1 className="font-display whitespace-nowrap text-[clamp(2.75rem,12.5vw,6.5rem)] leading-none tracking-[0.04em]">AO TEU REINO</h1>
          </div>
          <motion.p
            className="eyebrow mt-6 text-[#e3ddd3]"
            initial={false}
            animate={{ opacity: settled && !leaving ? 0.85 : 0, y: settled ? 0 : 6 }}
            transition={{ duration: 1.4, ease: CALM }}
          >
            Devocional Evangélico
          </motion.p>
        </motion.div>
      </div>

      {/* ENTRAR — discreto: texto e uma linha */}
      {(phase === "await" || phase === "ready") && (
        <motion.button
          key={phase}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (phase === "await") void touch(e.clientX, e.clientY);
            else void enterHome();
          }}
          className="group absolute bottom-[max(9%,calc(env(safe-area-inset-bottom)+48px))] left-1/2 flex min-h-12 min-w-32 -translate-x-1/2 flex-col items-center justify-center gap-2.5 text-[#f7f5f3]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: CALM }}
        >
          <span className="eyebrow pl-[0.32em] text-[0.6875rem] tracking-[0.32em]">Entrar</span>
          <span aria-hidden className="block h-px w-8 bg-[#e1b270]/70 transition-all duration-700 group-hover:w-14" />
        </motion.button>
      )}

      {/* Pular — sempre disponível */}
      {!leaving && phase !== "idle" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void enterHome(true);
          }}
          className="eyebrow absolute right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))] min-h-11 px-3 text-[0.625rem] text-[#f7f5f3]/50 transition-colors hover:text-[#f7f5f3]"
        >
          Pular
        </button>
      )}

      {/* A última onda: a luz da interface sobe e cobre a tela */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 z-10 h-[260vmax] w-[260vmax]"
        style={{
          x: "-50%",
          background: "radial-gradient(closest-side, var(--bg) 80%, rgb(225 178 112 / 0.5) 86%, rgb(247 245 243 / 0.0) 96%)",
        }}
        initial={false}
        animate={{ y: leaving ? "-28%" : "60%", opacity: phase === "home" ? 1 : 0 }}
        transition={{ y: { duration: reduced ? 0.4 : 1.5, ease: FLOW }, opacity: { duration: phase === "out" ? 0.8 : 0.5, ease: CALM } }}
      />

      <span className="sr-only" aria-live="polite">
        {phase === "await" ? "Botão Entrar disponível." : phase === "ready" ? "Ao Teu Reino. Devocional Evangélico. Botão Entrar disponível." : ""}
      </span>
      <noscript>
        <style>{`#abertura{display:none}`}</style>
      </noscript>
    </div>
  );
}
