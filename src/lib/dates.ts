/**
 * Datas do mês editorial. O "hoje" é sempre o do aparelho, com duas
 * exceções para revisão: ?hoje=AAAA-MM-DD na URL (guardado na sessão).
 */
export const MONTH = { year: 2026, month: 10 } as const;
export const DAYS_IN_MONTH = 31;

const WEEKDAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function isoFor(day: number) {
  return `${MONTH.year}-${String(MONTH.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function dayOf(iso: string) {
  return Number(iso.slice(8, 10));
}

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d, date: new Date(Date.UTC(y, m - 1, d)) };
}

export function weekday(iso: string) {
  return WEEKDAYS[parts(iso).date.getUTCDay()];
}
export function weekdayShort(iso: string) {
  return WEEKDAYS_SHORT[parts(iso).date.getUTCDay()];
}
export function monthName(iso: string) {
  return MONTHS[parts(iso).m - 1];
}

const OVERRIDE_KEY = "atr.hoje";

function localISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Data real (ou simulada para revisão), no formato ISO. */
export function todayISO(): string {
  try {
    const q = new URLSearchParams(window.location.search).get("hoje");
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) sessionStorage.setItem(OVERRIDE_KEY, q);
    if (q === "real") sessionStorage.removeItem(OVERRIDE_KEY);
    const o = sessionStorage.getItem(OVERRIDE_KEY);
    if (o) return o;
  } catch {
    /* sem sessionStorage */
  }
  return localISO();
}

/**
 * O dia do mês editorial que corresponde a hoje.
 * Antes de outubro, mostra o dia 1; depois, o dia 31.
 */
export function editorialToday(): { day: number; inMonth: boolean } {
  const t = todayISO();
  const first = isoFor(1);
  const last = isoFor(DAYS_IN_MONTH);
  if (t < first) return { day: 1, inMonth: false };
  if (t > last) return { day: DAYS_IN_MONTH, inMonth: false };
  return { day: dayOf(t), inMonth: true };
}

/** Um dia ainda não chegou? Depois de outubro, o mês inteiro fica aberto. */
export function isFuture(day: number) {
  return day > editorialToday().day;
}
