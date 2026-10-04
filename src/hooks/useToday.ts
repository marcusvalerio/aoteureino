"use client";

import { useSyncExternalStore } from "react";
import { editorialToday } from "@/lib/dates";

const noop = () => () => {};
let cache: { day: number; inMonth: boolean } | null = null;
const snapshot = () => (cache ??= editorialToday());

/** O dia editorial de hoje — null durante a renderização no servidor. */
export function useToday() {
  return useSyncExternalStore(noop, snapshot, () => null);
}
