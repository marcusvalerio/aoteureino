/**
 * Armazenamento local seguro. Sem conta, sem backend: tudo fica no aparelho.
 * Leituras e escritas nunca quebram a interface (modo privado, cota cheia etc.).
 */
import { useSyncExternalStore } from "react";

import { KEYS } from "./keys";

export { KEYS };

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sem armazenamento: a experiência segue, só não lembra */
  }
}

export function remove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* idem */
  }
}

/** Um valor persistido, observável por vários componentes ao mesmo tempo. */
export function createStore<T>(key: string, initial: T) {
  let value: T | undefined;
  const listeners = new Set<() => void>();

  const get = () => {
    if (value === undefined) value = { ...initial, ...read<T>(key, initial) } as T;
    return value;
  };
  const getArray = () => {
    if (value === undefined) value = read<T>(key, initial);
    return value;
  };
  const isArray = Array.isArray(initial);

  const snapshot = () => (isArray ? getArray() : get());

  const set = (next: T | ((prev: T) => T)) => {
    value = typeof next === "function" ? (next as (p: T) => T)(snapshot()) : next;
    write(key, value);
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        value = undefined;
        l();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };

  const reset = () => {
    value = undefined;
    remove(key);
    listeners.forEach((l) => l());
  };

  function useValue(): T {
    return useSyncExternalStore(subscribe, snapshot, () => initial);
  }

  return { get: snapshot, set, subscribe, reset, useValue };
}

/** true depois da hidratação — evita divergência entre servidor e aparelho. */
const noop = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
