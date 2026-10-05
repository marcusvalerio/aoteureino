/**
 * Cartão de compartilhamento desenhado em canvas (1080 × 1350, formato 4:5).
 * Superfície profunda atravessada por curvas de luz (a mesma linguagem da
 * abertura) e tipografia — sem propaganda, só uma assinatura discreta.
 */

export type CardMode = "pergunta" | "frase";

export interface CardInput {
  mode: CardMode;
  text: string;
  title: string;
  reference?: string | null;
}

const W = 1080;
const H = 1350;

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    lines.push(line);
  }
  return lines;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tracking: number, align: "left" | "center" = "left") {
  const chars = [...text];
  const width = chars.reduce((w, c) => w + ctx.measureText(c).width + tracking, -tracking);
  let cx = align === "center" ? x - width / 2 : x;
  for (const c of chars) {
    ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + tracking;
  }
}

export async function renderCard(input: CardInput): Promise<HTMLCanvasElement> {
  const display = cssVar("--font-serif") || "Georgia, serif";
  const sans = cssVar("--font-geist") || "system-ui, sans-serif";
  await Promise.all([document.fonts.load(`64px ${display}`), document.fonts.load(`500 24px ${sans}`)]).catch(() => {});

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Superfície profunda
  ctx.fillStyle = "#1b2b26";
  ctx.fillRect(0, 0, W, H);
  // Curvas de luz: anéis elípticos (como na abertura)
  const ring = (cx: number, cy: number, rx: number, ry: number, rot: number, r: number, core: number, soft: number, rgb: string, a: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(Math.max(0, r - core / 2 - soft), `rgba(${rgb},0)`);
    g.addColorStop(r - core / 2, `rgba(${rgb},${a})`);
    g.addColorStop(r + core / 2, `rgba(${rgb},${a})`);
    g.addColorStop(Math.min(1, r + core / 2 + soft), `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
    ctx.restore();
  };
  ring(-260, H + 260, 1750, 1350, -0.15, 0.62, 0.1, 0.08, "54,87,78", 0.95);
  ring(-200, H + 300, 1760, 1360, -0.15, 0.668, 0.008, 0.02, "247,245,243", 0.55);
  ring(-140, H + 380, 1800, 1420, -0.15, 0.7, 0.045, 0.06, "225,178,112", 0.42);
  ring(W + 380, -330, 1900, 1520, 0.25, 0.6, 0.12, 0.1, "98,65,51", 0.6);
  ring(W + 320, -280, 1850, 1480, 0.25, 0.665, 0.035, 0.05, "192,213,202", 0.3);
  // véu para a leitura do texto
  const veil = ctx.createLinearGradient(0, 0, 0, H);
  veil.addColorStop(0, "rgba(14,21,19,0.35)");
  veil.addColorStop(0.5, "rgba(14,21,19,0.15)");
  veil.addColorStop(1, "rgba(14,21,19,0.45)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, W, H);

  const M = 104;
  ctx.textBaseline = "alphabetic";

  // Rótulo
  ctx.fillStyle = "#e1b270";
  ctx.font = `500 25px ${sans}`;
  spaced(ctx, input.mode === "pergunta" ? "UMA PERGUNTA PARA LEVAR COM VOCÊ" : "PARA LEVAR COM VOCÊ", M, 196, 6.5);

  // Texto principal
  let size = 92;
  let lines: string[] = [];
  for (; size >= 58; size -= 4) {
    ctx.font = `${size}px ${display}`;
    lines = wrap(ctx, `“${input.text}”`, W - M * 2);
    if (lines.length * size * 1.12 < H * 0.52) break;
  }
  const lh = size * 1.12;
  const blockH = lines.length * lh;
  let y = Math.max(330, (H - blockH) / 2 + size * 0.2);
  for (const line of lines) {
    ctx.fillStyle = "#f7f5f3";
    ctx.fillText(line, M, y);
    y += lh;
  }

  // Rodapé: título do dia, referência e assinatura discreta
  ctx.fillStyle = "rgba(239,231,217,0.18)";
  ctx.fillRect(M, H - 220, 64, 2);
  ctx.fillStyle = "rgba(239,231,217,0.78)";
  ctx.font = `38px ${display}`;
  const titleLines = wrap(ctx, input.title, W - M * 2 - 220).slice(0, 2);
  titleLines.forEach((l, k) => ctx.fillText(l, M, H - 166 + k * 42));
  if (input.reference) {
    ctx.fillStyle = "rgba(239,231,217,0.5)";
    ctx.font = `400 23px ${sans}`;
    ctx.fillText(input.reference, M, H - 166 + titleLines.length * 42 + 6);
  }
  ctx.fillStyle = "rgba(247,245,243,0.6)";
  ctx.font = `28px ${display}`;
  const sig = "AO TEU REINO";
  const sigW = [...sig].reduce((w, c) => w + ctx.measureText(c).width + 1.5, -1.5);
  spaced(ctx, sig, W - M - sigW, H - 166, 1.5);

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
