/**
 * Importa o conteúdo editorial de um mês (.txt) para JSON estruturado.
 *
 *   node scripts/import-content.mts                       (usa content/fonte/outubro-2026.txt)
 *   node scripts/import-content.mts caminho/para/arquivo.txt
 *   node scripts/import-content.mts --skeleton            (31 dias pendentes)
 *
 * O texto é preservado como está: o importador só identifica dias e seções.
 * Nada é reescrito, resumido ou completado. O que não for reconhecido é
 * listado no relatório para revisão editorial.
 */
import { readFileSync, writeFileSync } from "node:fs";
import type { DayKind, Devotional, Scripture } from "../src/content/types.ts";

const YEAR = 2026;
const MONTH = 10;
const OUT = new URL("../src/content/outubro-2026/devotionals.json", import.meta.url);

const DEFAULT_SOURCE = new URL("../content/fonte/outubro-2026.txt", import.meta.url);

/**
 * Datas especiais: só são marcadas quando o próprio texto do dia cita a data.
 * O rótulo é exatamente o nome usado no arquivo.
 */
const SPECIAL_DATES: Record<number, string> = {
  15: "Dia do Professor",
  17: "Dia Internacional para a Erradicação da Pobreza",
  24: "Dia das Nações Unidas",
  31: "Dia Nacional da Proclamação do Evangelho",
};

/**
 * O arquivo não traz "pergunta para compartilhar". Por padrão ela vem do
 * PARE AQUI. Quando o PARE AQUI depende do contexto (ex.: "Depois de
 * responder à pergunta..."), usamos uma frase literal do próprio dia.
 */
const SHARE_FROM_TEXT: Record<number, string> = {
  4: "O que você realmente gostaria que Deus mudasse em sua vida — e o que você sabe que também precisa mudar em você?",
};

type SectionKey = "word" | "reflection" | "pause" | "prayer" | "practice" | "closing" | "reference" | "share";

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

// Ordem importa: marcadores mais longos primeiro.
const SECTION_MARKERS: [string, SectionKey][] = [
  ["UMA PERGUNTA PARA LEVAR COM VOCE", "share"],
  ["PERGUNTA PARA COMPARTILHAR", "share"],
  ["PARA LEVAR COM VOCE", "closing"],
  ["VIVA ISSO HOJE", "practice"],
  ["PARE AQUI", "pause"],
  ["A PALAVRA", "word"],
  ["PALAVRA", "word"],
  ["REFLEXAO", "reflection"],
  ["REFERENCIAS", "reference"],
  ["REFERENCIA", "reference"],
  ["ORACAO", "prayer"],
  ["ORE", "prayer"],
  ["PERGUNTA", "share"],
];

const KIND_MARKERS: [string, DayKind][] = [
  ["A VISITA DO ANJO", "visita"],
  ["VISITA DO ANJO", "visita"],
  ["DATA ESPECIAL", "data-especial"],
  ["ENCONTRO", "encontro"],
  ["MERGULHO", "mergulho"],
  ["PAUSA", "pausa"],
];

const WEEKDAYS = [
  "DOMINGO",
  "SEGUNDA",
  "SEGUNDA-FEIRA",
  "TERCA",
  "TERCA-FEIRA",
  "QUARTA",
  "QUARTA-FEIRA",
  "QUINTA",
  "QUINTA-FEIRA",
  "SEXTA",
  "SEXTA-FEIRA",
  "SABADO",
];

const DAY_HEADER = [
  /^(?:DIA\s+)?(\d{1,2})\s*(?:DE\s+)?OUTUBRO\b/,
  /^(\d{1,2})\s*[/.-]\s*10(?:\s*[/.-]\s*(?:20)?26)?\b/,
  /^DIA\s+(\d{1,2})\b/,
];

const REF = /^[—–-]?\s*\(?((?:[1-3]\s?)?[A-ZÀ-Úa-zà-ú][A-Za-zÀ-ú]+(?:\s+(?:dos|das|de|do)\s+[A-Za-zÀ-ú]+)?\s+\d+(?:[:.,]\s?\d+(?:\s?[-–]\s?\d+)?)?(?:\s*\([A-Z]{2,5}\))?)\)?\.?\s*$/;

function matchSection(line: string): { key: SectionKey; rest: string } | null {
  const f = fold(line).replace(/^[#*\s]+/, "");
  for (const [marker, key] of SECTION_MARKERS) {
    if (f === marker || f === marker + ":") return { key, rest: "" };
    const m = f.match(new RegExp(`^${marker}\\s*[:—–-]\\s*`));
    if (m) return { key, rest: line.slice(line.length - (f.length - m[0].length)).trim() };
  }
  return null;
}

function paragraphs(lines: string[]): string[] {
  const out: string[] = [];
  let cur: string[] = [];
  for (const l of lines) {
    if (l.trim() === "") {
      if (cur.length) out.push(cur.join("\n"));
      cur = [];
    } else cur.push(l.trim().replace(/\s+/g, " "));
  }
  if (cur.length) out.push(cur.join("\n"));
  return out.filter(Boolean);
}

/** "Salmos 90:12; Tiago 1:5" — uma linha só de referências. */
const CITATION = /^(?:[1-3]\s?)?[A-ZÀ-Úa-zà-ú][A-Za-zÀ-ú]+(?:\s(?:dos|das|de|do)\s[A-Za-zÀ-ú]+)?\s\d+(?::\d+(?:[–-]\d+)?(?:,\d+(?:[–-]\d+)?)*)?$/;
const isCitationList = (l: string) => l.split(";").every((p) => CITATION.test(p.trim()));

function scripture(lines: string[]): Scripture | null {
  const filled = lines.map((l) => l.trim()).filter(Boolean);
  if (filled.length && filled.every(isCitationList)) return { reference: filled.join("; "), text: [] };
  let reference = "";
  const rest: string[] = [];
  for (const l of lines) {
    const m = l.trim().match(REF);
    if (m && !reference) reference = m[1].trim();
    else rest.push(l);
  }
  const text = rest.map((l) => l.trim()).filter(Boolean);
  if (!text.length && !reference) return null;
  // Referência no fim do texto: “... — Salmos 23:1”
  if (!reference && text.length) {
    const last = text[text.length - 1];
    const m = last.match(/\s[—–-]\s*([^—–-]+\d+[:.]\d+[^—–-]*)$/);
    if (m) {
      reference = m[1].trim().replace(/[()]/g, "");
      text[text.length - 1] = last.slice(0, m.index).trim();
    }
  }
  return { reference, text };
}

function empty(day: number): Devotional {
  return {
    date: `${YEAR}-${String(MONTH).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    title: null,
    kind: "comum",
    label: null,
    word: null,
    reflection: [],
    pause: [],
    prayer: [],
    practice: [],
    closingPhrase: null,
    reference: null,
    shareQuestion: null,
    source: "pendente",
  };
}

function parse(txt: string) {
  const lines = txt.replace(/\r\n?/g, "\n").replace(/ /g, " ").split("\n");
  const blocks = new Map<number, string[]>();
  let current: number | null = null;
  const preamble: string[] = [];

  for (const line of lines) {
    if (/^\s*[-=_]{6,}\s*$/.test(line)) continue; // separadores
    const f = fold(line).replace(/^[#*\s]+/, "");
    let day: number | null = null;
    for (const re of DAY_HEADER) {
      const m = f.match(re);
      if (m) {
        const n = Number(m[1]);
        if (n >= 1 && n <= 31) day = n;
        break;
      }
    }
    if (day !== null && !blocks.has(day)) {
      current = day;
      blocks.set(day, []);
      // conteúdo depois da data na mesma linha (ex.: "04 OUTUBRO — DOMINGO")
      continue;
    }
    if (current === null) preamble.push(line);
    else blocks.get(current)!.push(line);
  }

  const warnings: string[] = [];
  const days: Devotional[] = [];

  for (let day = 1; day <= 31; day++) {
    const block = blocks.get(day);
    const d = empty(day);
    if (!block) {
      days.push(d);
      warnings.push(`Dia ${day}: não encontrado no arquivo.`);
      continue;
    }
    d.source = "arquivo";
    const sections = new Map<SectionKey, string[]>();
    const header: string[] = [];
    let key: SectionKey | null = null;
    for (const line of block) {
      const s = matchSection(line);
      if (s) {
        key = s.key;
        if (!sections.has(key)) sections.set(key, []);
        if (s.rest) sections.get(key)!.push(s.rest);
        continue;
      }
      if (key) sections.get(key)!.push(line);
      else header.push(line);
    }

    for (const raw of header.map((l) => l.trim()).filter(Boolean)) {
      const f = fold(raw);
      const kind = KIND_MARKERS.find(([m]) => f === m || f.startsWith(m + " ") || f.startsWith(m + ":"));
      if (kind) {
        d.kind = kind[1];
        const rest = raw.slice(kind[0].length).replace(/^[\s:—–-]+/, "").trim();
        if (rest && kind[1] === "data-especial") d.label = rest;
        else if (rest && !d.title) d.title = rest;
        continue;
      }
      if (WEEKDAYS.includes(f.replace(/[.,]$/, ""))) continue;
      const t = raw.replace(/^T[IÍ]TULO\s*:\s*/i, "");
      if (!d.title) d.title = t;
      else if (!d.label) d.label = t;
      else warnings.push(`Dia ${day}: linha de cabeçalho não reconhecida: “${raw}”`);
    }

    d.word = sections.has("word") ? scripture(sections.get("word")!) : null;
    d.reflection = paragraphs(sections.get("reflection") ?? []);
    d.pause = paragraphs(sections.get("pause") ?? []);
    d.prayer = paragraphs(sections.get("prayer") ?? []);
    d.practice = paragraphs(sections.get("practice") ?? []);
    d.closingPhrase = paragraphs(sections.get("closing") ?? []).join(" ") || null;
    d.reference = paragraphs(sections.get("reference") ?? []).join(" ") || null;
    d.shareQuestion =
      paragraphs(sections.get("share") ?? [])
        .join(" ")
        .replace(/^["“]|["”]$/g, "") || null;

    const special = SPECIAL_DATES[day];
    if (special && d.kind === "comum") {
      if (d.reflection.join(" ").includes(special)) {
        d.kind = "data-especial";
        d.label = special;
      } else warnings.push(`Dia ${day}: data especial “${special}” não citada no texto — não marcada.`);
    }

    if (!d.shareQuestion) {
      const fromText = SHARE_FROM_TEXT[day];
      if (fromText) {
        if (d.reflection.includes(fromText)) d.shareQuestion = fromText;
        else warnings.push(`Dia ${day}: pergunta de compartilhamento não encontrada literalmente no texto.`);
      } else if (d.pause.length === 1 && d.pause[0].trim().endsWith("?")) d.shareQuestion = d.pause[0];
    }

    const missing: string[] = [];
    if (!d.title) missing.push("título");
    if (d.word && !d.word.reference) missing.push("A PALAVRA (referência)");
    if (!d.reflection.length) missing.push("REFLEXÃO");
    if (!d.pause.length) missing.push("PARE AQUI");
    if (!d.prayer.length) missing.push("ORE");
    if (!d.practice.length) missing.push("VIVA ISSO HOJE");
    if (!d.closingPhrase) missing.push("PARA LEVAR COM VOCÊ");
    if (!d.reference) missing.push("REFERÊNCIA");
    if (missing.length) warnings.push(`Dia ${day}: faltando ${missing.join(", ")}.`);

    days.push(d);
  }

  if (preamble.some((l) => l.trim())) warnings.push(`Texto antes do primeiro dia ignorado (${preamble.filter((l) => l.trim()).length} linhas).`);
  return { days, warnings };
}

const args = process.argv.slice(2);
let days: Devotional[];
let warnings: string[] = [];
if (args[0] === "--skeleton") {
  days = Array.from({ length: 31 }, (_, i) => empty(i + 1));
  warnings.push("Esqueleto gerado: nenhum arquivo editorial foi importado.");
} else {
  const src = args[0] && !args[0].startsWith("--") ? args[0] : DEFAULT_SOURCE;
  ({ days, warnings } = parse(readFileSync(src, "utf8")));
}

const out = args.includes("--out") ? new URL(args[args.indexOf("--out") + 1], `file://${process.cwd()}/`) : OUT;
writeFileSync(out, JSON.stringify({ id: "2026-10", label: "Outubro", year: YEAR, days }, null, 2) + "\n");

const kinds = days.filter((d) => d.kind !== "comum").map((d) => `${d.date.slice(8)} ${d.kind}${d.label ? ` (${d.label})` : ""}`);
console.log(`✓ ${days.filter((d) => d.source === "arquivo").length}/31 dias importados do arquivo → ${out.pathname}`);
if (kinds.length) console.log(`  Dias especiais: ${kinds.join(" · ")}`);
for (const w of warnings) console.log(`  · ${w}`);
