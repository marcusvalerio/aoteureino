/**
 * Geometria da cena da abertura, em unidades da cena (quadrado de 2000).
 * Espelha scripts/opening/scene.mjs — se a cena mudar, atualizar aqui.
 */
export const SCENE = 2000;
export const DOOR = { left: 960, right: 1140, top: 1135, bottom: 1420 };
export const DOOR_CENTER = { x: 1050, y: 1290 };
/** Ponto em torno do qual a câmera se afasta (na parede, à esquerda da porta). */
export const FOCUS = { x: 620, y: 1180 };
/** Recorte de detalhe renderizado em alta resolução (public/opening/pedra.webp). */
export const CLOSE = { left: 396, top: 856, size: 600 };

export const pct = (n: number) => `${(n / SCENE) * 100}%`;
