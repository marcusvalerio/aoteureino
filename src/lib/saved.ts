import { KEYS, createStore } from "./storage";

export type SavedKind = "devocional" | "frase" | "passagem";

export interface SavedItem {
  id: string;
  kind: SavedKind;
  /** Título do devocional ou referência da passagem. */
  title: string;
  /** Frase, trecho ou versículos. */
  text?: string;
  reference?: string;
  href: string;
  savedAt: number;
}

export const savedStore = createStore<SavedItem[]>(KEYS.saved, []);
export const useSaved = savedStore.useValue;

export function isSaved(items: SavedItem[], id: string) {
  return items.some((i) => i.id === id);
}

export function toggleSaved(item: Omit<SavedItem, "savedAt">) {
  savedStore.set((items) =>
    items.some((i) => i.id === item.id) ? items.filter((i) => i.id !== item.id) : [{ ...item, savedAt: Date.now() }, ...items],
  );
}

export function removeSaved(id: string) {
  savedStore.set((items) => items.filter((i) => i.id !== id));
}
