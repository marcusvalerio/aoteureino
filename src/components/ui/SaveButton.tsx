"use client";

import { Bookmark } from "lucide-react";
import { motion } from "motion/react";
import { isSaved, toggleSaved, useSaved, type SavedItem } from "@/lib/saved";

export function SaveButton({
  item,
  label = "Guardar",
  className = "",
  withText = false,
}: {
  item: Omit<SavedItem, "savedAt">;
  label?: string;
  className?: string;
  withText?: boolean;
}) {
  const saved = isSaved(useSaved(), item.id);
  return (
    <button
      type="button"
      onClick={() => toggleSaved(item)}
      aria-pressed={saved}
      aria-label={saved ? `Remover dos salvos: ${label}` : label}
      title={saved ? "Remover dos salvos" : label}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2.5 rounded-full px-2 transition-colors duration-300 hover:text-ink ${
        saved ? "text-accent" : "text-ink-2"
      } ${className}`}
    >
      <motion.span
        key={String(saved)}
        initial={{ scale: saved ? 0.8 : 1, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
        className="inline-flex"
      >
        <Bookmark size={19} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
      </motion.span>
      {withText && <span className="eyebrow text-[0.625rem]">{saved ? "Guardado" : "Guardar"}</span>}
    </button>
  );
}
