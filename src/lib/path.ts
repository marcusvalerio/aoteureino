import { KEYS, createStore } from "./storage";

/**
 * O caminho percorrido: os dias que a pessoa leu até o fim.
 * Não existe contagem, porcentagem ou sequência — só o registro.
 */
export const pathStore = createStore<string[]>(KEYS.path, []);
export const usePath = pathStore.useValue;

export function markWalked(iso: string) {
  if (pathStore.get().includes(iso)) return;
  pathStore.set((days) => [...days, iso]);
}

/** Experiências escondidas já vividas (ex.: a visita). */
export const visitsStore = createStore<string[]>(KEYS.visits, []);
export const useVisits = visitsStore.useValue;

export function markVisited(iso: string) {
  if (visitsStore.get().includes(iso)) return;
  visitsStore.set((days) => [...days, iso]);
}
