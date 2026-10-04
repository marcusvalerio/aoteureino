/**
 * Repositório de conteúdo. Toda a interface lê daqui — nunca diretamente
 * dos arquivos. Trocar a origem (CMS, API) significa mudar só este módulo.
 */
import monthData from "./outubro-2026/devotionals.json";
import { PASSAGES } from "./palavra/selecao";
import type { Devotional, Month, Passage } from "./types";

export type { Devotional, DayKind, Month, Passage, Scripture } from "./types";

export const MONTH_CONTENT = monthData as Month;

export function getDevotional(day: number): Devotional | undefined {
  return MONTH_CONTENT.days[day - 1];
}

export function allDevotionals(): Devotional[] {
  return MONTH_CONTENT.days;
}

/** O devocional tem texto suficiente para ser lido? */
export function isReadable(d: Devotional) {
  return d.reflection.length > 0 || d.pause.length > 0 || d.prayer.length > 0 || (d.word?.text.length ?? 0) > 0;
}

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** Livro + capítulo citados num texto de referência ("Salmos 121:1-2; João 14"). */
function citations(text: string | null | undefined): { book: string; chapter: number }[] {
  if (!text) return [];
  const out: { book: string; chapter: number }[] = [];
  const re = /((?:[1-3]\s?)?[a-zà-ú]+(?:\s(?:dos|das|de|do)\s[a-zà-ú]+)?)\s+(\d+)/gi;
  for (const m of text.matchAll(re)) out.push({ book: fold(m[1]), chapter: Number(m[2]) });
  return out;
}

/**
 * PALAVRA do dia: uma passagem da seleção editorial, sempre diferente
 * da passagem principal do devocional daquele dia.
 */
export function palavraFor(day: number): Passage {
  const d = getDevotional(day);
  const used = [...citations(d?.word?.reference), ...citations(d?.reference)];
  for (let i = 0; i < PASSAGES.length; i++) {
    const p = PASSAGES[(day - 1 + i) % PASSAGES.length];
    const clash = used.some((c) => c.book === fold(p.book) && c.chapter === p.chapter);
    if (!clash) return p;
  }
  return PASSAGES[(day - 1) % PASSAGES.length];
}

export function passageText(p: Passage) {
  return p.verses.map((v) => v.text).join(" ");
}

/** Palavras que mantêm maiúscula quando o título sai da caixa alta. */
const PROPER = new Set(["deus", "jesus", "cristo", "reino", "evangelho", "senhor", "espírito", "bíblia"]);

/**
 * O arquivo traz títulos em CAIXA ALTA. A interface mostra em caixa de
 * frase — muda só a apresentação, nunca o texto.
 */
export function displayTitle(title: string | null | undefined): string {
  if (!title) return "";
  if (title !== title.toUpperCase()) return title;
  const lower = title.toLocaleLowerCase("pt-BR");
  const words = lower.split(/(\s+)/).map((w) => {
    const bare = w.replace(/[^\p{L}]/gu, "");
    return PROPER.has(bare) ? w.replace(bare, bare[0].toLocaleUpperCase("pt-BR") + bare.slice(1)) : w;
  });
  const s = words.join("");
  return s.charAt(0).toLocaleUpperCase("pt-BR") + s.slice(1);
}

export const KIND_LABEL: Record<string, string> = {
  encontro: "Encontro",
  "data-especial": "Data especial",
  pausa: "Pausa",
  mergulho: "Mergulho",
};
