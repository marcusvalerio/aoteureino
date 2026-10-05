"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { applySettings, useSettings } from "@/lib/settings";
import { Opening } from "./opening/Opening";
import { BottomNav } from "./nav/BottomNav";
import { LightField } from "./light/LightField";
import { AMBIENT } from "./light/presets";

export function AppShell({ children }: { children: React.ReactNode }) {
  const settings = useSettings();

  useEffect(() => {
    applySettings();
    const mq = [window.matchMedia("(prefers-color-scheme: dark)"), window.matchMedia("(prefers-reduced-motion: reduce)")];
    mq.forEach((m) => m.addEventListener("change", applySettings));
    return () => mq.forEach((m) => m.removeEventListener("change", applySettings));
  }, [settings]);

  return (
    <MotionConfig reducedMotion={settings.motion === "reduzido" ? "always" : "user"}>
      <a
        href="#conteudo"
        className="eyebrow sr-only z-50 bg-surface px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Ir para o conteúdo
      </a>
      <Opening />
      {/* Uma curva da abertura permanece: a atmosfera do aplicativo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          opacity: "var(--wave-alpha)",
          maskImage: "linear-gradient(to bottom, #000 0%, #000 18%, transparent 58%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 18%, transparent 58%)",
        }}
      >
        <LightField bands={AMBIENT} seed={11} breathe={settings.motion !== "reduzido"} className="absolute inset-0" />
        <div className="grain absolute inset-0 opacity-[0.035] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-overlay" />
      </div>
      <div className="mx-auto flex min-h-dvh w-full max-w-[44rem] flex-col">
        <main id="conteudo" className="flex flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
      </div>
      <BottomNav />
    </MotionConfig>
  );
}
