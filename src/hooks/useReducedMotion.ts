"use client";

import { useReducedMotionConfig } from "motion/react";
import { useHydrated } from "@/lib/storage";

/** Movimento reduzido, decidido só depois da hidratação (o servidor não sabe). */
export function useCalmMotion() {
  const reduced = useReducedMotionConfig();
  const hydrated = useHydrated();
  return hydrated && Boolean(reduced);
}
