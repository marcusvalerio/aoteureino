"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { allDevotionals, displayTitle } from "@/content";
import { dayOf } from "@/lib/dates";
import { pathStore, visitsStore } from "@/lib/path";
import { savedStore } from "@/lib/saved";
import { DEFAULT_SETTINGS, settingsStore, updateSettings, useSettings, type Settings } from "@/lib/settings";
import { KEYS, remove, useHydrated } from "@/lib/storage";
import { REPLAY_EVENT } from "@/components/opening/Opening";

const ease = [0.22, 0.61, 0.36, 1] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-8">
      <h2 className="eyebrow mb-6 text-accent">{title}</h2>
      {children}
    </section>
  );
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: ReactNode; aria?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid border border-line" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          aria-label={o.aria}
          onClick={() => onChange(o.value)}
          className={`min-h-12 px-2 text-[0.875rem] transition-colors duration-300 ${value === o.value ? "bg-ink text-bg" : "text-ink-2 hover:text-ink"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center justify-between gap-6 py-2">
      <span>
        <span className="block text-[0.9375rem] text-ink">{label}</span>
        {hint && <span className="mt-1 block text-[0.8125rem] leading-snug text-ink-3">{hint}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-7 w-12 rounded-full border border-line-strong bg-bg-deep transition-colors duration-300 peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]" />
        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-ink-3 transition-all duration-300 peer-checked:translate-x-5 peer-checked:bg-bg" />
      </span>
    </label>
  );
}

function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-line">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex min-h-16 w-full items-center justify-between text-left"
      >
        <span className="eyebrow text-accent">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.4, ease }} className="text-ink-3">
          <ChevronDown size={18} strokeWidth={1.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-[0.9375rem] leading-relaxed text-ink-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Mais() {
  const s = useSettings();
  const hydrated = useHydrated();
  const [confirmErase, setConfirmErase] = useState(false);
  const set = (patch: Partial<Settings>) => updateSettings(patch);

  const replay = () => window.dispatchEvent(new Event(REPLAY_EVENT));

  const erase = () => {
    savedStore.reset();
    pathStore.reset();
    visitsStore.reset();
    settingsStore.set(DEFAULT_SETTINGS);
    remove(KEYS.settings);
    remove(KEYS.opening);
    updateSettings({});
    setConfirmErase(false);
  };

  return (
    <section className="flex flex-1 flex-col px-6 sm:px-10">
      <header className="pb-8 pt-[max(2rem,calc(env(safe-area-inset-top)+1rem))]">
        <p className="eyebrow text-accent">Mais</p>
        <h1 className="font-display mt-4 text-[2.4rem] leading-[1.05] text-ink">Ajustes</h1>
      </header>

      <div className={hydrated ? "" : "invisible"}>
        <Section title="Aparência">
          <Segmented
            label="Tema"
            value={s.theme}
            onChange={(theme) => set({ theme })}
            options={[
              { value: "sistema", label: "Sistema" },
              { value: "claro", label: "Calcário" },
              { value: "escuro", label: "Basalto" },
            ]}
          />
          <p className="mt-3 text-[0.8125rem] text-ink-3">Calcário é claro; Basalto é escuro.</p>
        </Section>

        <Section title="Tamanho do texto">
          <Segmented
            label="Tamanho do texto"
            value={s.textSize}
            onChange={(textSize) => set({ textSize })}
            options={[
              { value: 0, label: <span className="text-[0.8rem]">A</span>, aria: "Menor" },
              { value: 1, label: <span className="text-[0.95rem]">A</span>, aria: "Padrão" },
              { value: 2, label: <span className="text-[1.1rem]">A</span>, aria: "Grande" },
              { value: 3, label: <span className="text-[1.3rem]">A</span>, aria: "Maior" },
            ]}
          />
          <p className="reading font-display mt-6 text-ink">A Palavra é a Palavra.</p>
        </Section>

        <Section title="Preferências">
          <Toggle
            label="Reduzir movimento"
            hint="Transições mínimas, sem deslocamentos. O sistema também é respeitado."
            checked={s.motion === "reduzido"}
            onChange={(v) => set({ motion: v ? "reduzido" : "sistema" })}
          />
          <Toggle
            label="Ler dias à frente"
            hint="Permite abrir os dias de outubro que ainda não chegaram."
            checked={s.readAhead}
            onChange={(readAhead) => set({ readAhead })}
          />
          <button type="button" onClick={replay} className="mt-4 flex min-h-14 w-full items-center justify-between border-t border-line text-left">
            <span>
              <span className="block text-[0.9375rem] text-ink">Ver a abertura novamente</span>
              <span className="mt-1 block text-[0.8125rem] text-ink-3">Pedra, casa, caminho, porta.</span>
            </span>
            <span className="eyebrow text-[0.625rem] text-ink-2">Ver</span>
          </button>
        </Section>

        <div className="pb-4">
          <Disclosure title="Sobre">
            <p>
              AO TEU REINO é um devocional diário. Cada dia traz uma passagem, uma reflexão, um momento para parar, uma oração, uma prática e uma frase para levar com
              você.
            </p>
            <p className="mt-4">
              A casa da abertura é uma reconstrução artística inspirada na arquitetura simples da Galileia do século I. Não representa nenhuma casa histórica específica.
            </p>
            <p className="mt-4 text-ink-3">Versão 1.0 · Conteúdo de outubro de 2026.</p>
          </Disclosure>
          <Disclosure title="Referências">
            <p className="mb-5">Passagens indicadas em cada devocional de outubro:</p>
            <ul className="space-y-2.5">
              {allDevotionals().map((d) => (
                <li key={d.date} className="flex gap-4">
                  <span className="font-display w-6 shrink-0 text-ink-3">{String(dayOf(d.date)).padStart(2, "0")}</span>
                  <span>
                    <span className="text-ink">{d.reference ?? d.word?.reference}</span>
                    <span className="block text-[0.8125rem] text-ink-3">{displayTitle(d.title)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[0.8125rem] text-ink-3">
              A aba Palavra indica uma passagem por dia, escolhida pela editoria, para leitura na sua Bíblia. O texto integral será incluído quando a tradução e a licença estiverem definidas.
            </p>
          </Disclosure>
          <Disclosure title="Privacidade">
            <p>Não há conta, cadastro ou rastreamento. O que você guarda, suas preferências e os dias lidos ficam apenas neste aparelho, no armazenamento do navegador.</p>
            {!confirmErase ? (
              <button type="button" onClick={() => setConfirmErase(true)} className="eyebrow mt-6 min-h-12 border border-line-strong px-5 text-[0.625rem] text-ink">
                Apagar dados deste aparelho
              </button>
            ) : (
              <div className="mt-6 border border-line-strong p-5">
                <p className="text-ink">Apagar salvos, preferências e o caminho percorrido? Isso não pode ser desfeito.</p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={erase} className="eyebrow min-h-12 flex-1 bg-ink text-[0.625rem] text-bg">
                    Apagar
                  </button>
                  <button type="button" onClick={() => setConfirmErase(false)} className="eyebrow min-h-12 flex-1 border border-line text-[0.625rem] text-ink-2">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </Disclosure>
          <div className="border-t border-line" />
        </div>
      </div>
    </section>
  );
}
