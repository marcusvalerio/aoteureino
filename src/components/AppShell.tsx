"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { applySettings, useSettings } from "@/lib/settings";
import { Opening } from "./opening/Opening";
import { BottomNav } from "./nav/BottomNav";

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
      <div aria-hidden className="window-light pointer-events-none fixed inset-0 -z-10" />
      <div className="mx-auto flex min-h-dvh w-full max-w-[44rem] flex-col">
        <main id="conteudo" className="flex flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
      </div>
      <BottomNav />
    </MotionConfig>
  );
}
