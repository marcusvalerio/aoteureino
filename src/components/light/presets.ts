import type { Band } from "./LightField";

/**
 * Composições do campo de luz. Poucas camadas, muito grandes.
 * Cores (triplets RGB) da paleta:
 *   balsam 54 87 78 · teak 98 65 51 · demerara 225 178 112
 *   fresco 192 213 202 · venerable 247 245 243 · aesthetic 227 221 211
 */
const BALSAM = "54 87 78";
const BALSAM_DEEP = "34 53 47";
const TEAK = "98 65 51";
const DEMERARA = "225 178 112";
const FRESCO = "192 213 202";
const WHITE = "247 245 243";

/** Apaga as pontas de uma curva, mantendo visível o trecho voltado para (x, y). */
const fade = (x: number, y: number, size = 62) => `radial-gradient(ellipse ${size}% ${size}% at ${x}% ${y}%, #000 35%, transparent 78%)`;

/**
 * Abertura: horizontes de luz que atravessam a tela.
 * Um feixe de curvas sobe do canto inferior esquerdo; outro desce do alto à direita.
 */
export const OPENING: Band[] = [
  // profundidade
  { w: "230vmax", h: "175vmax", cx: -24, cy: 110, ring: 0.62, core: 0.11, soft: 0.08, color: BALSAM, alpha: 0.95, mask: fade(78, 22), group: "deep" },
  { w: "260vmax", h: "205vmax", cx: 136, cy: -24, ring: 0.6, core: 0.12, soft: 0.1, color: TEAK, alpha: 0.5, mask: fade(22, 80), group: "deep" },
  { w: "240vmax", h: "190vmax", cx: 128, cy: 132, ring: 0.64, core: 0.08, soft: 0.09, color: BALSAM_DEEP, alpha: 0.9, mask: fade(25, 22), drift: 0.7, group: "deep" },
  // luz
  { w: "232vmax", h: "176vmax", cx: -18, cy: 113, ring: 0.668, core: 0.008, soft: 0.02, color: WHITE, alpha: 0.82, mask: fade(76, 24, 56), drift: 1.1, group: "light" },
  { w: "250vmax", h: "200vmax", cx: -10, cy: 121, ring: 0.7, core: 0.045, soft: 0.065, color: DEMERARA, alpha: 0.5, mask: fade(72, 26), group: "light" },
  { w: "275vmax", h: "222vmax", cx: 124, cy: -21, ring: 0.665, core: 0.035, soft: 0.055, color: FRESCO, alpha: 0.42, mask: fade(26, 78), group: "light" },
  { w: "222vmax", h: "180vmax", cx: 128, cy: -17, ring: 0.722, core: 0.006, soft: 0.014, color: WHITE, alpha: 0.55, mask: fade(24, 76, 54), drift: 1.2, group: "light" },
];

/** Atmosfera do aplicativo: uma curva da abertura que permaneceu. Cores pelo tema. */
export const AMBIENT: Band[] = [
  { w: "240vmax", h: "200vmax", cx: 128, cy: -30, ring: 0.665, core: 0.05, soft: 0.09, color: "var(--wave-a)", alpha: 0.42, mask: fade(26, 78), group: "deep" },
  { w: "222vmax", h: "180vmax", cx: 128, cy: -25, ring: 0.722, core: 0.005, soft: 0.016, color: "var(--wave-b)", alpha: 0.32, mask: fade(24, 76, 54), group: "light" },
];

/** PARE AQUI: uma única curva de luz atravessando a superfície profunda. */
export const PAUSE: Band[] = [
  { w: "420%", h: "300%", cx: -40, cy: 160, ring: 0.66, core: 0.05, soft: 0.1, color: BALSAM, alpha: 0.9, drift: 0.6, group: "deep" },
  { w: "420%", h: "300%", cx: -38, cy: 162, ring: 0.705, core: 0.006, soft: 0.02, color: DEMERARA, alpha: 0.7, drift: 0.6, group: "light" },
];

/** Visita: o campo da abertura, mais baixo e mais lento. */
export const VISITA: Band[] = OPENING.map((b) => ({ ...b, alpha: b.alpha * (b.group === "light" ? 0.45 : 0.6) }));
