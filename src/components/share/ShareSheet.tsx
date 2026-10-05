"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Download, Share, X } from "lucide-react";
import { canvasToBlob, renderCard, type CardMode } from "./card";

const ease = [0.22, 0.61, 0.36, 1] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  question: string | null;
  phrase: string | null;
  reference?: string | null;
}

export function ShareSheet({ open, onClose, title, question, phrase, reference }: Props) {
  const [mode, setMode] = useState<CardMode>(question ? "pergunta" : "frase");
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const text = mode === "pergunta" ? question : phrase;

  useEffect(() => {
    if (!open || !text) return;
    let alive = true;
    void renderCard({ mode, text, title, reference }).then((c) => {
      if (!alive) return;
      canvasRef.current = c;
      setUrl(c.toDataURL("image/png"));
    });
    return () => {
      alive = false;
    };
  }, [open, mode, text, title, reference]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const plain = text ? `“${text}”\n\n${mode === "pergunta" ? "Uma pergunta para levar com você" : "Para levar com você"} — ${title}${reference ? ` (${reference})` : ""}\nAo Teu Reino` : "";

  const shareImage = async () => {
    const c = canvasRef.current;
    if (!c) return;
    const blob = await canvasToBlob(c);
    if (!blob) return;
    const file = new File([blob], "ao-teu-reino.png", { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: plain });
        return;
      }
      if (navigator.share) {
        await navigator.share({ text: plain });
        return;
      }
    } catch {
      return; // cancelado pela pessoa
    }
    download();
  };

  const download = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "ao-teu-reino.png";
    a.click();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sem área de transferência */
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <div className="absolute inset-0 bg-[#0b0a09]/70" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Compartilhar uma reflexão"
            className="relative max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-t-[1.75rem] bg-bg px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:rounded-[1.75rem]"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="flex items-center justify-between">
              <p className="eyebrow text-ink-2">Compartilhar</p>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-2 hover:bg-line"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {question && phrase && (
              <div className="mt-3 grid grid-cols-2 gap-1 rounded-full border border-line bg-bg-deep/50 p-1" role="radiogroup" aria-label="O que compartilhar">
                {(["pergunta", "frase"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mode === m}
                    onClick={() => setMode(m)}
                    className={`eyebrow min-h-10 rounded-full text-[0.625rem] transition-colors duration-300 ${
                      mode === m ? "bg-surface text-ink shadow-[var(--shadow)]" : "text-ink-3 hover:text-ink"
                    }`}
                  >
                    {m === "pergunta" ? "Pergunta" : "Frase"}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 aspect-[4/5] w-full overflow-hidden rounded-2xl bg-deep shadow-[0_24px_50px_-30px_rgb(0_0_0/0.8)]">
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element -- imagem gerada localmente (data URL)
                <img src={url} alt={`Cartão: ${text}`} className="h-full w-full" />
              ) : (
                <div className="h-full w-full animate-pulse bg-deep" />
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <button type="button" onClick={shareImage} className="eyebrow flex min-h-14 flex-col items-center justify-center gap-2 rounded-2xl bg-[var(--cta)] text-[0.625rem] text-[var(--cta-ink)]">
                <Share size={17} strokeWidth={1.5} />
                Enviar
              </button>
              <button type="button" onClick={download} className="eyebrow flex min-h-14 flex-col items-center justify-center gap-2 rounded-2xl border border-line text-[0.625rem] text-ink-2 hover:text-ink">
                <Download size={17} strokeWidth={1.5} />
                Imagem
              </button>
              <button type="button" onClick={copy} className="eyebrow flex min-h-14 flex-col items-center justify-center gap-2 rounded-2xl border border-line text-[0.625rem] text-ink-2 hover:text-ink">
                {copied ? <Check size={17} strokeWidth={1.5} /> : <Copy size={17} strokeWidth={1.5} />}
                {copied ? "Copiado" : "Texto"}
              </button>
            </div>
            <p className="sr-only" aria-live="polite">
              {copied ? "Texto copiado" : ""}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
