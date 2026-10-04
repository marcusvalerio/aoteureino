"use client";

/**
 * A abertura do AO TEU REINO.
 *
 * Pedra → casa → caminho → porta. Uma imagem pré-renderizada, camadas
 * de luz e transformações de escala — nada de 3D, nada de WebGL.
 *
 * A cena é uma reconstrução artística inspirada na arquitetura simples da
 * Galileia do século I. Não representa nenhuma casa histórica específica.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotionConfig } from "motion/react";
import { KEYS, write } from "@/lib/storage";
import { CLOSE, DOOR, DOOR_CENTER, FOCUS, pct } from "./geometry";

type Phase = "idle" | "dark" | "reveal" | "pull" | "title" | "ready" | "entering" | "veil" | "out" | "done";

const PULL_FROM = 4.2;
const EASE_CALM = [0.22, 0.61, 0.36, 1] as const;
const EASE_CAMERA = [0.45, 0, 0.15, 1] as const;
const EASE_DOOR = [0.7, 0, 0.84, 0] as const;

export const REPLAY_EVENT = "atr:abertura";

function after(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function decode(src: string) {
  const img = new Image();
  img.src = src;
  try {
    await Promise.race([img.decode(), after(2500)]);
  } catch {
    /* segue mesmo sem a imagem */
  }
}

export function Opening() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [fast, setFast] = useState(false);
  const reduced = useReducedMotionConfig() ?? false;
  const run = useRef(0);

  const finish = useCallback(async () => {
    write(KEYS.opening, "vista");
    document.documentElement.style.overflow = "";
    setPhase("out");
    await after(750);
    document.documentElement.dataset.opening = "done";
    setPhase("done");
  }, []);

  const start = useCallback(async () => {
    const id = ++run.current;
    const alive = () => run.current === id;
    setFast(false);
    setPhase("dark");
    await decode(window.innerWidth > 900 ? "/opening/casa.webp" : "/opening/casa-1200.webp");
    if (!reduced) await decode("/opening/pedra.webp");
    if (!alive()) return;
    if (reduced) {
      setPhase("ready");
      return;
    }
    setPhase("reveal");
    await after(2300);
    if (!alive()) return;
    setPhase("pull");
    await after(3900);
    if (!alive()) return;
    setPhase("title");
    await after(1300);
    if (!alive()) return;
    setPhase((p) => (p === "title" ? "ready" : p));
  }, [reduced]);

  // Decide no carregamento: abertura completa só na primeira entrada.
  useEffect(() => {
    if (document.documentElement.dataset.opening === "full") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- inicia a sequência após a hidratação
      void start();
    }
    const replay = () => {
      document.documentElement.dataset.opening = "full";
      window.scrollTo(0, 0);
      void start();
    };
    window.addEventListener(REPLAY_EVENT, replay);
    return () => window.removeEventListener(REPLAY_EVENT, replay);
  }, [start]);

  const skipToEnd = () => {
    if (phase === "reveal" || phase === "pull" || phase === "dark") {
      run.current++;
      setFast(true);
      setPhase("ready");
    }
  };

  const enter = async (quick = false) => {
    const id = ++run.current;
    if (reduced || quick) {
      setFast(true);
      setPhase("veil");
      await after(reduced ? 450 : 600);
    } else {
      setPhase("entering");
      await after(1900);
      if (run.current !== id) return;
      setPhase("veil");
      await after(450);
    }
    if (run.current !== id) return;
    void finish();
  };

  // Tecla Esc pula; Enter entra.
  useEffect(() => {
    if (phase === "idle" || phase === "done") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") void enter(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (phase === "done") return null;

  const scale = phase === "dark" || phase === "reveal" ? PULL_FROM : 1;
  const zoomDoor = phase === "entering" || phase === "veil";
  const lit = phase !== "idle" && phase !== "dark";
  const showTitle = phase === "title" || phase === "ready";
  const showEnter = phase === "ready";
  const t = (d: number) => (fast ? Math.min(d, 0.6) : d);

  return (
    <div
      id="abertura"
      role="dialog"
      aria-modal="true"
      aria-label="Abertura — AO TEU REINO"
      className={`fixed inset-0 z-[100] overflow-hidden text-[#efe6d6] ${phase === "out" ? "pointer-events-none" : "bg-[#070605]"}`}
      onClick={skipToEnd}
    >
      {phase !== "idle" && phase !== "out" && (
        <>
          {/* Palco quadrado que cobre a tela */}
          <div
            className="absolute left-1/2 top-1/2 aspect-square"
            style={{ width: "max(100vw, 100dvh)", transform: "translate(-50%, -50%)" }}
            aria-hidden
          >
            <motion.div
              className="absolute inset-0"
              style={{ transformOrigin: `${pct(DOOR_CENTER.x)} ${pct(DOOR_CENTER.y)}`, willChange: "transform" }}
              initial={false}
              animate={{ scale: zoomDoor ? 14 : 1 }}
              transition={{ duration: zoomDoor ? 1.5 : 0, delay: zoomDoor ? 0.45 : 0, ease: EASE_DOOR }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ transformOrigin: `${pct(FOCUS.x)} ${pct(FOCUS.y)}`, willChange: "transform" }}
                initial={{ scale: reduced ? 1 : PULL_FROM, y: "0%" }}
                animate={{ scale: reduced ? 1 : scale, y: phase === "pull" || showTitle ? "0%" : "1.2%" }}
                transition={{ duration: t(phase === "pull" ? 5.2 : 0.8), ease: EASE_CAMERA }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- imagem estática pré-renderizada */}
                <img
                  src="/opening/casa-1200.webp"
                  srcSet="/opening/casa-1200.webp 1200w, /opening/casa.webp 2400w"
                  sizes="max(100vw, 100vh)"
                  alt=""
                  className="absolute inset-0 h-full w-full select-none"
                  draggable={false}
                />
                {!reduced && (
                  <motion.img
                    src="/opening/pedra.webp"
                    alt=""
                    draggable={false}
                    className="absolute select-none"
                    style={{
                      left: pct(CLOSE.left),
                      top: pct(CLOSE.top),
                      width: pct(CLOSE.size),
                      height: pct(CLOSE.size),
                    }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: phase === "dark" || phase === "reveal" ? 1 : 0 }}
                    transition={{ duration: t(1.8), delay: phase === "pull" ? 1.4 : 0, ease: "linear" }}
                  />
                )}
                {/* A porta recebe luz */}
                <motion.div
                  className="absolute"
                  style={{
                    left: pct(DOOR.left),
                    top: pct(DOOR.top),
                    width: pct(DOOR.right - DOOR.left),
                    height: pct(DOOR.bottom - DOOR.top),
                    background:
                      "radial-gradient(120% 80% at 50% 85%, #fff3d6 0%, #f3d397 38%, #c98f4c 75%, #8a5a2c 100%)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: zoomDoor ? 1 : showEnter ? 0.12 : 0 }}
                  transition={{ duration: zoomDoor ? 0.9 : 2.4, ease: EASE_CALM }}
                />
                {/* Luz que se derrama sobre o caminho */}
                <motion.div
                  className="absolute"
                  style={{
                    left: pct(DOOR.left - 260),
                    top: pct(DOOR.bottom - 6),
                    width: pct(DOOR.right - DOOR.left + 520),
                    height: pct(520),
                    background: "radial-gradient(50% 60% at 50% 0%, rgb(243 211 151 / 0.55), transparent 70%)",
                    clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: zoomDoor ? 1 : 0 }}
                  transition={{ duration: 0.9, ease: EASE_CALM }}
                />
                {/* Halo da porta */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    left: pct(DOOR_CENTER.x - 420),
                    top: pct(DOOR_CENTER.y - 420),
                    width: pct(840),
                    height: pct(840),
                    background: "radial-gradient(closest-side, rgb(243 205 140 / 0.45), transparent)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: zoomDoor ? 1 : 0 }}
                  transition={{ duration: 1, ease: EASE_CALM }}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Escuridão que a luz vai vencendo */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[#050403]"
            initial={{ opacity: 1 }}
            animate={{
              opacity: phase === "dark" ? 1 : phase === "reveal" ? 0.42 : zoomDoor ? 0.1 : 0.18,
            }}
            transition={{ duration: t(phase === "reveal" ? 2.6 : 1.4), ease: EASE_CALM }}
          />
          {/* Luz rasante, vinda da esquerda */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(104deg, rgb(236 196 140 / 0.2) 0%, rgb(236 196 140 / 0.06) 32%, transparent 58%)",
            }}
            initial={{ opacity: 0, x: "-6%" }}
            animate={{ opacity: lit ? 1 : 0, x: lit ? "0%" : "-6%" }}
            transition={{ duration: t(3.2), ease: EASE_CALM }}
          />
          {/* Sombra superior para o título respirar */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[45%]"
            style={{ background: "linear-gradient(to bottom, rgb(5 4 3 / 0.55), transparent)" }}
          />

          {/* Título */}
          <motion.div
            className="absolute inset-x-0 top-[13%] px-6 text-center sm:top-[11%]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showTitle ? 1 : 0, y: showTitle ? 0 : 10 }}
            transition={{ duration: zoomDoor ? 0.5 : t(1.6), ease: EASE_CALM }}
          >
            <h1 className="font-display text-[2.6rem] leading-[1.02] tracking-[0.06em] text-[#f1e8d8] sm:text-6xl">
              AO TEU
              <br />
              REINO
            </h1>
            <p className="eyebrow mt-5 text-[#cdbfa8]">Devocional Evangélico</p>
          </motion.div>

          {/* Entrar */}
          <motion.div
            className="absolute inset-x-0 bottom-[max(9%,calc(env(safe-area-inset-bottom)+40px))] flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: showEnter ? 1 : 0 }}
            transition={{ duration: t(1.2), ease: EASE_CALM }}
          >
            <button
              type="button"
              disabled={!showEnter}
              onClick={(e) => {
                e.stopPropagation();
                void enter();
              }}
              className="eyebrow group relative min-h-12 min-w-44 px-8 text-[0.75rem] tracking-[0.42em] text-[#f1e8d8] transition-colors duration-700 hover:text-white"
            >
              <span className="absolute inset-0 border border-[#f1e8d8]/35 transition-colors duration-700 group-hover:border-[#f3d397]/70" />
              <span className="relative pl-[0.42em]">Entrar</span>
            </button>
          </motion.div>

          {/* Pular — sempre disponível */}
          {!zoomDoor && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void enter(true);
              }}
              className="eyebrow absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] min-h-11 px-3 text-[0.625rem] text-[#efe6d6]/55 transition-colors hover:text-[#efe6d6]"
            >
              Pular
            </button>
          )}
        </>
      )}

      {/* Véu final: a luz da casa vira a luz da interface */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--bg)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "veil" ? 1 : 0 }}
        transition={
          phase === "out" ? { duration: 0.7, ease: EASE_CALM } : { duration: reduced || fast ? 0.45 : 0.4, ease: "easeIn" }
        }
      />
      <span className="sr-only" aria-live="polite">
        {phase === "ready" ? "Ao Teu Reino. Devocional Evangélico. Botão Entrar disponível." : ""}
      </span>
      <noscript>
        <style>{`#abertura{display:none}`}</style>
      </noscript>
    </div>
  );
}
