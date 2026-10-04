/**
 * Cartão de compartilhamento desenhado em canvas (1080 × 1350, formato 4:5).
 * Pedra basáltica, luz rasante e tipografia — sem propaganda, só uma
 * assinatura discreta no rodapé.
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

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
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
  const display = cssVar("--font-faculty") || "Georgia, serif";
  const sans = cssVar("--font-geist") || "system-ui, sans-serif";
  await Promise.all([document.fonts.load(`64px ${display}`), document.fonts.load(`500 24px ${sans}`)]).catch(() => {});

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Pedra
  ctx.fillStyle = "#2a2622";
  ctx.fillRect(0, 0, W, H);
  const tex = await loadImage("/textures/basalto.webp");
  if (tex) {
    const pattern = ctx.createPattern(tex, "repeat");
    if (pattern) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }
  // Luz rasante vinda do alto, à esquerda
  const light = ctx.createRadialGradient(W * 0.18, -H * 0.05, 40, W * 0.18, -H * 0.05, H * 1.05);
  light.addColorStop(0, "rgba(243, 208, 150, 0.30)");
  light.addColorStop(0.45, "rgba(243, 208, 150, 0.07)");
  light.addColorStop(1, "rgba(0, 0, 0, 0.35)");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, W, H);
  const floor = ctx.createLinearGradient(0, H * 0.6, 0, H);
  floor.addColorStop(0, "rgba(0,0,0,0)");
  floor.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = floor;
  ctx.fillRect(0, 0, W, H);

  const M = 104;
  ctx.textBaseline = "alphabetic";

  // Rótulo
  ctx.fillStyle = "#d6b67c";
  ctx.font = `500 25px ${sans}`;
  spaced(ctx, input.mode === "pergunta" ? "UMA PERGUNTA PARA LEVAR COM VOCÊ" : "PARA LEVAR COM VOCÊ", M, 196, 6.5);

  // Texto principal — gravado na pedra (sombra acima, luz abaixo)
  let size = 76;
  let lines: string[] = [];
  for (; size >= 48; size -= 4) {
    ctx.font = `${size}px ${display}`;
    lines = wrap(ctx, `“${input.text}”`, W - M * 2);
    if (lines.length * size * 1.24 < H * 0.52) break;
  }
  const lh = size * 1.24;
  const blockH = lines.length * lh;
  let y = Math.max(330, (H - blockH) / 2 + size * 0.2);
  for (const line of lines) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillText(line, M, y - 2);
    ctx.fillStyle = "rgba(255,240,215,0.07)";
    ctx.fillText(line, M, y + 2);
    ctx.fillStyle = "#efe7d9";
    ctx.fillText(line, M, y);
    y += lh;
  }

  // Rodapé: título do dia, referência e assinatura discreta
  ctx.fillStyle = "rgba(239,231,217,0.18)";
  ctx.fillRect(M, H - 220, 64, 2);
  ctx.fillStyle = "rgba(239,231,217,0.78)";
  ctx.font = `30px ${display}`;
  const titleLines = wrap(ctx, input.title, W - M * 2 - 220).slice(0, 2);
  titleLines.forEach((l, k) => ctx.fillText(l, M, H - 166 + k * 38));
  if (input.reference) {
    ctx.fillStyle = "rgba(239,231,217,0.5)";
    ctx.font = `400 23px ${sans}`;
    ctx.fillText(input.reference, M, H - 166 + titleLines.length * 38 + 8);
  }
  ctx.fillStyle = "rgba(239,231,217,0.55)";
  ctx.font = `500 19px ${sans}`;
  ctx.textAlign = "right";
  const sig = "AO TEU REINO";
  const sigW = [...sig].reduce((w, c) => w + ctx.measureText(c).width + 6, -6);
  ctx.textAlign = "left";
  spaced(ctx, sig, W - M - sigW, H - 166, 6);

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
