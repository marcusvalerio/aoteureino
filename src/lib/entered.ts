"use client";

/**
 * A interface "nasce" da abertura: as telas só fazem sua entrada quando
 * a abertura libera. Em visitas seguintes, isso é imediato.
 */
import { useSyncExternalStore } from "react";

export const ENTER_EVENT = "atr:entrou";

const subscribe = (cb: () => void) => {
  window.addEventListener(ENTER_EVENT, cb);
  return () => window.removeEventListener(ENTER_EVENT, cb);
};
const snapshot = () => document.documentElement.dataset.opening !== "full";

export function useEntered() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

export function announceEntered(state: "revealing" | "done") {
  document.documentElement.dataset.opening = state;
  window.dispatchEvent(new Event(ENTER_EVENT));
}
