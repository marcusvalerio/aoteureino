"use client";

/**
 * LightField — o campo de luz do AO TEU REINO.
 *
 * Poucas camadas muito grandes. Cada camada é um anel elíptico desenhado
 * com radial-gradient (sem filtros, sem canvas), com as pontas apagadas por
 * máscara. Só `transform` muda a cada quadro: o navegador compõe as camadas
 * na GPU sem repintar.
 *
 * - live: um único laço rAF move as camadas; velocidade e "perturbação"
 *   (o toque do usuário) são controladas por ref.
 * - estático: as camadas ficam paradas (ou com deriva CSS muito lenta).
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface Band {
  /** largura/altura do elemento (ex.: "260vmax", "320%") */
  w: string;
  h: string;
  /** centro, em % do contêiner */
  cx: number;
  cy: number;
  /** raio do anel (0–1, relativo ao lado mais curto do elemento) */
  ring: number;
  /** espessura do núcleo do anel e da borda suave (0–1) */
  core: number;
  soft: number;
  /** "r g b" ou var(--wave-x) */
  color: string;
  alpha: number;
  /** máscara para apagar as pontas da curva */
  mask?: string;
  /** amplitude da deriva (1 = padrão) */
  drift?: number;
  /** camadas "deep" e "light" têm opacidade controlada separadamente */
  group?: "deep" | "light";
}

export interface LightFieldHandle {
  /** velocidade alvo (1 = respiração normal) */
  setSpeed: (v: number) => void;
  /** perturbação a partir de um ponto (0–100, em % do contêiner) */
  perturb: (x: number, y: number, strength?: number) => void;
}

interface Props {
  bands: Band[];
  live?: boolean;
  /** tempo inicial (define a pose estática) */
  seed?: number;
  className?: string;
  deepOpacity?: number;
  lightOpacity?: number;
  /** deriva CSS lenta quando não está "live" */
  breathe?: boolean;
}

function gradient(b: Band) {
  const c = b.color;
  const r0 = Math.max(0, b.ring - b.core / 2 - b.soft) * 100;
  const r1 = (b.ring - b.core / 2) * 100;
  const r2 = (b.ring + b.core / 2) * 100;
  const r3 = Math.min(1, b.ring + b.core / 2 + b.soft) * 100;
  return `radial-gradient(closest-side, rgb(${c} / 0) ${r0}%, rgb(${c} / ${b.alpha}) ${r1}%, rgb(${c} / ${b.alpha}) ${r2}%, rgb(${c} / 0) ${r3}%)`;
}

function pose(b: Band, k: number, t: number, push: { x: number; y: number; r: number }) {
  const ph = k * 1.73;
  const a = b.drift ?? 1;
  const x = (Math.sin(t * 0.07 + ph) * 1.4 + push.x) * a;
  const y = (Math.cos(t * 0.05 + ph * 0.8) * 1.1 + push.y) * a;
  const rot = (Math.sin(t * 0.04 + ph) * 5 + push.r) * a;
  const s = 1 + Math.sin(t * 0.09 + ph) * 0.035 * a;
  return `translate(calc(-50% + ${x.toFixed(3)}%), calc(-50% + ${y.toFixed(3)}%)) rotate(${rot.toFixed(3)}deg) scale(${s.toFixed(4)}, ${(2 - s).toFixed(4)})`;
}

export const LightField = forwardRef<LightFieldHandle, Props>(function LightField(
  { bands, live = false, seed = 0, className = "", deepOpacity = 1, lightOpacity = 1, breathe = false },
  ref,
) {
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const state = useRef({
    t: seed,
    speed: 1,
    target: 1,
    push: bands.map(() => ({ x: 0, y: 0, r: 0 })),
  });

  useImperativeHandle(ref, () => ({
    setSpeed: (v) => {
      state.current.target = v;
    },
    perturb: (px, py, strength = 1) => {
      const s = state.current;
      bands.forEach((b, k) => {
        const dx = b.cx - px;
        const dy = b.cy - py;
        const len = Math.hypot(dx, dy) || 1;
        const depth = b.group === "light" ? 1.4 : 0.8;
        s.push[k].x += (dx / len) * 3.2 * strength * depth;
        s.push[k].y += (dy / len) * 3.2 * strength * depth;
        s.push[k].r += (k % 2 ? 1 : -1) * 7 * strength * depth;
      });
      s.target = Math.max(s.target, 3.2 * strength);
    },
  }));

  // Pose inicial (também é a pose estática)
  useEffect(() => {
    const s = state.current;
    bands.forEach((b, k) => {
      const el = els.current[k];
      if (el) el.style.transform = pose(b, k, s.t, s.push[k]);
    });
  }, [bands]);

  useEffect(() => {
    if (!live) return;
    let raf = 0;
    let last = performance.now();
    const s = state.current;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // velocidade aproxima-se do alvo devagar; o alvo volta a 1 sozinho
      s.speed += (s.target - s.speed) * Math.min(1, dt * 1.6);
      s.target += (1 - s.target) * Math.min(1, dt * 0.35);
      s.t += dt * s.speed;
      const decay = Math.exp(-dt / 2.4);
      bands.forEach((b, k) => {
        const p = s.push[k];
        p.x *= decay;
        p.y *= decay;
        p.r *= decay;
        const el = els.current[k];
        if (el) el.style.transform = pose(b, k, s.t, p);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, bands]);

  const render = (group: "deep" | "light", opacity: number) => (
    <div className="absolute inset-0" style={{ opacity, transition: "opacity 2.4s cubic-bezier(0.22, 0.61, 0.36, 1)" }} aria-hidden>
      {bands.map((b, k) =>
        (b.group ?? "deep") === group ? (
          <div
            key={k}
            ref={(el) => {
              els.current[k] = el;
            }}
            className="absolute"
            style={{
              left: `${b.cx}%`,
              top: `${b.cy}%`,
              width: b.w,
              height: b.h,
              background: gradient(b),
              maskImage: b.mask,
              WebkitMaskImage: b.mask,
              willChange: live ? "transform" : undefined,
              transform: "translate(-50%, -50%)",
              animation: breathe && !live ? `${k % 2 ? "drift-b" : "drift-a"} ${46 + k * 9}s ease-in-out ${-k * 7}s infinite alternate` : undefined,
            }}
          />
        ) : null,
      )}
    </div>
  );

  return (
    <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden>
      {render("deep", deepOpacity)}
      {render("light", lightOpacity)}
    </div>
  );
});
