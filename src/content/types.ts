/**
 * Modelo editorial do AO TEU REINO.
 *
 * O conteúdo vive fora dos componentes. Hoje é lido de arquivos locais
 * (gerados por scripts/import-content.ts); no futuro pode vir de um CMS
 * ou backend sem que a interface mude.
 */

/** Ritmo do dia. A maioria dos dias é "comum" — a diferença é rara de propósito. */
export type DayKind =
  | "comum"
  | "encontro"
  | "data-especial"
  | "pausa"
  | "mergulho"
  /** Experiência escondida. Nunca é revelada antes do próprio dia. */
  | "visita";

export interface Scripture {
  /** Ex.: "Salmos 121:1-2" */
  reference: string;
  /** Texto bíblico, um item por versículo ou parágrafo. Vazio quando o arquivo traz só a referência. */
  text: string[];
}

export interface Devotional {
  /** ISO, ex.: "2026-10-04" */
  date: string;
  title: string | null;
  kind: DayKind;
  /** Rótulo editorial opcional para datas especiais (vindo do arquivo). */
  label: string | null;
  /** A PALAVRA */
  word: Scripture | null;
  /** REFLEXÃO — parágrafos */
  reflection: string[];
  /** PARE AQUI */
  pause: string[];
  /** ORE */
  prayer: string[];
  /** VIVA ISSO HOJE */
  practice: string[];
  /** PARA LEVAR COM VOCÊ */
  closingPhrase: string | null;
  /** REFERÊNCIA */
  reference: string | null;
  /** UMA PERGUNTA PARA LEVAR COM VOCÊ — usada no compartilhamento. */
  shareQuestion: string | null;
  /** De onde veio o texto — permite auditar o que é editorial e o que ainda falta. */
  source: "arquivo" | "pendente";
  /** Campos alterados por content/editorial/*.ajustes.json (auditoria). */
  ajustes?: string[];
}

export interface Passage {
  id: string;
  reference: string;
  /** Livro, para evitar repetir a passagem do devocional do dia. */
  book: string;
  chapter: number;
  /** Texto integral — só quando a tradução oficial estiver definida e licenciada. */
  verses?: { n: number; text: string }[];
}

export interface Month {
  id: string; // "2026-10"
  label: string; // "Outubro"
  year: number;
  days: Devotional[];
}
