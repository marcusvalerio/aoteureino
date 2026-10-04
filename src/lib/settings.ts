import { KEYS, createStore } from "./storage";

export type ThemePref = "sistema" | "claro" | "escuro";
export type MotionPref = "sistema" | "reduzido";

export interface Settings {
  theme: ThemePref;
  /** 0 menor · 1 padrão · 2 grande · 3 maior */
  textSize: 0 | 1 | 2 | 3;
  motion: MotionPref;
  /** Permite abrir dias que ainda não chegaram. */
  readAhead: boolean;
  /** Mostra os números dos versículos na PALAVRA. */
  verseNumbers: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "sistema",
  textSize: 1,
  motion: "sistema",
  readAhead: false,
  verseNumbers: true,
};

export const settingsStore = createStore<Settings>(KEYS.settings, DEFAULT_SETTINGS);
export const useSettings = settingsStore.useValue;

export function updateSettings(patch: Partial<Settings>) {
  settingsStore.set((s) => ({ ...s, ...patch }));
  applySettings();
}

/** Reflete as preferências no <html> (tema, tamanho do texto, movimento). */
export function applySettings() {
  const s = settingsStore.get();
  const root = document.documentElement;
  const dark =
    s.theme === "escuro" || (s.theme === "sistema" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme = dark ? "dark" : "light";
  root.dataset.text = String(s.textSize);
  const reduced = s.motion === "reduzido" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.dataset.motion = reduced ? "reduced" : "full";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#151311" : "#ebe5da");
}
