// Gera a cena da abertura (SVG) — uma casa simples de basalto,
// reconstrução artística inspirada na arquitetura da Galileia do séc. I.
// Não representa nenhuma casa histórica específica.
//
// A cena é desenhada em um quadrado de 2000 × 2000 unidades.
// As coordenadas abaixo são espelhadas em src/components/opening/geometry.ts.

export const SCENE = 2000;

export const HOUSE = { left: 500, right: 1500, top: 900, ground: 1420 };
export const DOOR = { left: 960, right: 1140, top: 1135, bottom: 1420 };
export const LINTEL = { left: 925, right: 1175, top: 1088, bottom: 1135 };
export const WINDOW = { left: 1300, right: 1342, rowsAbove: [2, 3] };
export const FOCUS = { x: 620, y: 1180 };

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let r = rng(1907);
const between = (a, b) => a + r() * (b - a);
const f = (n) => Math.round(n * 10) / 10;

// Divide um intervalo em fileiras de alturas irregulares que somam exatamente o total.
function rows(from, to, min, max) {
  const total = to - from;
  const hs = [];
  let acc = 0;
  while (acc < total - min) {
    const h = between(min, max);
    hs.push(h);
    acc += h;
  }
  const k = total / acc;
  const out = [];
  let y = from;
  for (const h of hs) {
    out.push([y, y + h * k]);
    y += h * k;
  }
  return out;
}

// Polígono irregular dentro de um retângulo — pedra de campo, quase sem aparelhamento.
function stoneShape(x0, y0, x1, y1, roughness = 0.22) {
  const w = x1 - x0;
  const h = y1 - y0;
  // nem toda pedra ocupa a fileira inteira
  const shrinkTop = h * between(0, roughness * 0.45);
  const shrinkBot = h * between(0, roughness * 0.2);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + shrinkTop + y1 - shrinkBot) / 2;
  const rx = w / 2;
  const ry = (h - shrinkTop - shrinkBot) / 2;
  const n = 7 + Math.floor(r() * 4);
  const pts = [];
  const phase = r() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const a = phase + (i / n) * Math.PI * 2 + between(-0.18, 0.18);
    // superelipse: faces mais retas que um seixo
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const e = 0.42;
    const k = between(1 - roughness * 0.7, 1.02);
    pts.push([cx + rx * k * Math.sign(c) * Math.abs(c) ** e, cy + ry * k * Math.sign(sn) * Math.abs(sn) ** e]);
  }
  return pts;
}

const BASALT = ['#353230', '#2f2d2a', '#3a3632', '#2b2927', '#33302c', '#3d3730', '#282624', '#403931', '#312e2b'];

function stonePath(pts) {
  return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
}

function stone(pts, tone) {
  const d = stonePath(pts);
  return (
    `<path d="${d}" fill="${tone}"/>` +
    `<path d="${d}" fill="url(#convex)"/>` +
    `<path d="${d}" fill="url(#underside)"/>`
  );
}

// Alvéolos do basalto — pequenas cavidades escuras.
function pores(x0, y0, x1, y1) {
  let s = '';
  const n = Math.floor(((x1 - x0) * (y1 - y0)) / 900);
  for (let i = 0; i < n; i++) {
    const x = between(x0 + 6, x1 - 6);
    const y = between(y0 + 6, y1 - 6);
    const rad = between(0.8, 2.6);
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad)}" fill="#14110f" opacity="${f(between(0.35, 0.8))}"/>`;
    s += `<circle cx="${f(x + rad * 0.35)}" cy="${f(y + rad * 0.45)}" r="${f(rad * 0.55)}" fill="#6f665b" opacity="0.18"/>`;
  }
  return s;
}

function course(y0, y1, x0, x1, holes, { min, max, gap }) {
  let s = '';
  let x = x0;
  while (x < x1 - 8) {
    let w = between(min, max);
    if (x1 - (x + w) < min * 0.6) w = x1 - x;
    let segs = [[x, x + w]];
    for (const [hl, hr] of holes) {
      segs = segs.flatMap(([a, b]) => {
        if (b <= hl - gap || a >= hr + gap) return [[a, b]];
        const out = [];
        if (hl - gap - a > 14) out.push([a, hl - gap]);
        if (b - (hr + gap) > 14) out.push([hr + gap, b]);
        return out;
      });
    }
    for (const [a, b] of segs) {
      const pts = stoneShape(a + gap / 2, y0 + gap / 2, b - gap / 2, y1 - gap / 2);
      s += stone(pts, BASALT[Math.floor(r() * BASALT.length)]);
      s += pores(a + gap, y0 + gap, b - gap, y1 - gap);
      // pedrinhas de calço nas juntas
      if (r() < 0.3 && b - a > 50) {
        const cx = b - between(0, 6);
        const cy = between(y0 + 8, y1 - 8);
        const sz = between(5, 10);
        s += stone(stoneShape(cx - sz, cy - sz * 0.7, cx + sz, cy + sz * 0.7, 0.3), BASALT[Math.floor(r() * BASALT.length)]);
      }
    }
    x += w;
  }
  return s;
}

const windowRect = { top: Infinity, bottom: -Infinity };

function facade() {
  const { left, right, top, ground } = HOUSE;
  const gap = 6;
  let s = '';
  const lower = rows(DOOR.top, ground, 50, 96);
  const lintelRow = [[LINTEL.top, LINTEL.bottom]];
  const upper = rows(top, LINTEL.top, 40, 80);

  // Fileiras acima do lintel (de baixo para cima, para posicionar a janela)
  upper.forEach(([y0, y1], i) => {
    const fromLintel = upper.length - 1 - i;
    const inWindow = WINDOW.rowsAbove.includes(fromLintel);
    if (inWindow) {
      windowRect.top = Math.min(windowRect.top, y0 + gap / 2);
      windowRect.bottom = Math.max(windowRect.bottom, y1 - gap / 2);
    }
    const holes = inWindow ? [[WINDOW.left, WINDOW.right]] : [];
    s += course(y0, y1, left, right, holes, { min: 60, max: 150, gap });
  });

  // Fileira do lintel
  for (const [y0, y1] of lintelRow) {
    s += course(y0, y1, left, right, [[LINTEL.left, LINTEL.right]], { min: 80, max: 170, gap });
  }

  // Fileiras ao lado da porta (mais altas perto do chão)
  lower.forEach(([y0, y1]) => {
    s += course(y0, y1, left, right, [[DOOR.left, DOOR.right]], { min: 85, max: 190, gap });
  });

  // Lintel — uma peça única, mais clara, levemente desgastada.
  const lp = stoneShape(LINTEL.left, LINTEL.top + 3, LINTEL.right, LINTEL.bottom - 2, 0.06);
  s += stone(lp, '#4c463e');
  s += pores(LINTEL.left + 8, LINTEL.top + 8, LINTEL.right - 8, LINTEL.bottom - 8);

  return s;
}

// Parede lateral em escorço — dá volume à casa sem 3D.
function sideWall() {
  const x0 = HOUSE.right;
  const x1 = HOUSE.right + 150;
  const topNear = HOUSE.top;
  const topFar = HOUSE.top + 34;
  const botNear = HOUSE.ground;
  const botFar = HOUSE.ground - 22;
  const map = (u, v) => {
    const x = x0 + (x1 - x0) * u;
    const yt = topNear + (topFar - topNear) * u;
    const yb = botNear + (botFar - botNear) * u;
    return [x, yt + (yb - yt) * v];
  };
  let s = `<path d="M${x0} ${topNear}L${x1} ${topFar}L${x1} ${botFar}L${x0} ${botNear}Z" fill="#1d1a17"/>`;
  const vs = rows(0, 1, 0.09, 0.14);
  for (const [v0, v1] of vs) {
    let u = 0;
    while (u < 0.98) {
      let w = between(0.22, 0.42);
      if (1 - (u + w) < 0.15) w = 1 - u;
      const pts = stoneShape(u * 100 + 3, v0 * 100 + 0.6, (u + w) * 100 - 3, v1 * 100 - 0.6, 0.1).map(
        ([px, py]) => map(px / 100, py / 100),
      );
      s += `<path d="${stonePath(pts)}" fill="${BASALT[Math.floor(r() * BASALT.length)]}" opacity="0.55"/>`;
      u += w;
    }
  }
  // sombra própria
  s += `<path d="M${x0} ${topNear}L${x1} ${topFar}L${x1} ${botFar}L${x0} ${botNear}Z" fill="url(#sideShade)"/>`;
  return s;
}

// Telhado plano: vigas de madeira, ramos e barro batido.
function roof() {
  const { left, right, top } = HOUSE;
  let s = '';
  const far = right + 150;
  // camada de barro com borda irregular, levemente abaulada
  let d = `M${left - 22} ${top + 2}`;
  for (let x = left - 22; x <= far; x += 18) {
    const t = x > right ? (x - right) / 150 : 0;
    const y = top - 38 - between(0, 9) - Math.sin(((x - left) / (right - left)) * Math.PI) * 6 + t * 30;
    d += `L${f(x)} ${f(y)}`;
  }
  d += `L${far} ${top + 34}L${right} ${top + 2}Z`;
  s += `<path d="${d}" fill="#2b241e"/>`;
  s += `<path d="${d}" fill="url(#roofShade)"/>`;
  // ramos aparentes sob o barro
  s += `<rect x="${left - 22}" y="${top - 12}" width="${right - left + 44}" height="12" fill="#1f1914"/>`;
  for (let x = left - 20; x < right + 20; x += between(5, 11)) {
    s += `<path d="M${f(x)} ${top - 12}L${f(x + between(-3, 3))} ${f(top - between(1, 4))}" stroke="#3a2e23" stroke-width="${f(between(1.2, 2.6))}" opacity="${f(between(0.4, 0.9))}"/>`;
  }
  // cabeças das vigas, salientes da parede
  for (let x = left + 40; x < right - 20; x += between(104, 128)) {
    const w = between(30, 38);
    const h = between(26, 32);
    const y = top - 4;
    s += `<rect x="${f(x - w / 2 + 6)}" y="${f(y + h - 4)}" width="${f(w)}" height="10" fill="#000" opacity="0.45"/>`;
    s += `<rect x="${f(x - w / 2)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="7" fill="#271d15"/>`;
    s += `<ellipse cx="${f(x)}" cy="${f(y + h / 2)}" rx="${f(w * 0.3)}" ry="${f(h * 0.28)}" fill="none" stroke="#35281c" stroke-width="1.4"/>`;
    s += `<rect x="${f(x - w / 2)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="7" fill="url(#convex)"/>`;
  }
  return s;
}

// Muro baixo do pátio, à esquerda — pedras soltas, sem argamassa.
function courtyardWall() {
  const x0 = 120;
  const x1 = HOUSE.left;
  const yTop = 1292;
  const yBot = HOUSE.ground + 6;
  let s = '';
  for (const [y0, y1] of rows(yTop, yBot, 34, 50)) {
    s += course(y0, y1, x0, x1, [], { min: 46, max: 110, gap: 8 });
  }
  return s;
}

function ground() {
  let s = `<rect x="0" y="${HOUSE.ground - 10}" width="${SCENE}" height="${SCENE - HOUSE.ground + 10}" fill="url(#earth)"/>`;
  // o caminho até a porta
  const pd = `M${DOOR.left - 6} ${HOUSE.ground}L${DOOR.right + 6} ${HOUSE.ground}L${1500} ${SCENE}L${620} ${SCENE}Z`;
  s += `<path d="${pd}" fill="url(#path)" filter="url(#soft)"/>`;
  // soleira
  s += `<path d="M${DOOR.left - 26} ${HOUSE.ground - 4}L${DOOR.right + 26} ${HOUSE.ground - 4}L${DOOR.right + 40} ${HOUSE.ground + 18}L${DOOR.left - 40} ${HOUSE.ground + 18}Z" fill="#37322c"/>`;
  // pedras soltas pelo chão, maiores perto do observador
  for (let i = 0; i < 34; i++) {
    const y = between(HOUSE.ground + 30, SCENE + 40);
    const depth = (y - HOUSE.ground) / (SCENE - HOUSE.ground);
    const x = between(-50, SCENE + 50);
    const onPath = Math.abs(x - 1060) < 140 + depth * 360;
    if (onPath) continue;
    const w = between(12, 34) * (0.5 + depth * 4);
    const h = w * between(0.4, 0.62);
    const pts = stoneShape(x - w / 2, y - h / 2, x + w / 2, y + h / 2, 0.3);
    s += `<ellipse cx="${f(x + w * 0.1)}" cy="${f(y + h * 0.4)}" rx="${f(w * 0.6)}" ry="${f(h * 0.24)}" fill="#050403" opacity="0.7"/>`;
    s += stone(pts, ['#24211e', '#2a2622', '#1f1c1a'][Math.floor(r() * 3)]);
  }
  return s;
}

function hills() {
  let d = `M0 1290`;
  for (let x = 0; x <= SCENE; x += 40) {
    const y = 1215 + Math.sin(x / 260) * 26 + Math.sin(x / 97 + 1.3) * 9 + (x > 1300 ? -(x - 1300) * 0.05 : 0);
    d += `L${x} ${f(y)}`;
  }
  d += `L${SCENE} 1440L0 1440Z`;
  let d2 = `M0 1330`;
  for (let x = 0; x <= SCENE; x += 40) {
    const y = 1300 + Math.sin(x / 180 + 2) * 18 + Math.sin(x / 61) * 5;
    d2 += `L${x} ${f(y)}`;
  }
  d2 += `L${SCENE} 1440L0 1440Z`;
  return `<path d="${d}" fill="#1f2125"/><path d="${d2}" fill="#191817"/>`;
}

export function buildScene({ viewBox = `0 0 ${SCENE} ${SCENE}`, width = 2400, height = 2400 } = {}) {
  const wallMortar = `<rect x="${HOUSE.left}" y="${HOUSE.top}" width="${HOUSE.right - HOUSE.left}" height="${HOUSE.ground - HOUSE.top}" fill="#120f0c"/>`;
  const doorway =
    `<rect x="${DOOR.left}" y="${DOOR.top}" width="${DOOR.right - DOOR.left}" height="${DOOR.bottom - DOOR.top}" fill="#080706"/>` +
    `<rect x="${DOOR.left}" y="${DOOR.top}" width="${DOOR.right - DOOR.left}" height="${DOOR.bottom - DOOR.top}" fill="url(#doorDepth)"/>`;
  r = rng(1907);
  windowRect.top = Infinity;
  windowRect.bottom = -Infinity;
  const facadeSvg = facade();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0d1015"/>
    <stop offset="0.38" stop-color="#1a1d24"/>
    <stop offset="0.53" stop-color="#2d2b2c"/>
    <stop offset="0.6" stop-color="#4a3c31"/>
    <stop offset="0.66" stop-color="#3a3029"/>
  </linearGradient>
  <radialGradient id="dawn" cx="0.22" cy="0.6" r="0.55">
    <stop offset="0" stop-color="#8a6644" stop-opacity="0.55"/>
    <stop offset="0.5" stop-color="#5a4434" stop-opacity="0.18"/>
    <stop offset="1" stop-color="#000" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="earth" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a241f"/>
    <stop offset="0.4" stop-color="#1c1815"/>
    <stop offset="1" stop-color="#0e0c0b"/>
  </linearGradient>
  <linearGradient id="path" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#4a4037" stop-opacity="0.9"/>
    <stop offset="0.6" stop-color="#2f2924" stop-opacity="0.75"/>
    <stop offset="1" stop-color="#1a1613" stop-opacity="0.4"/>
  </linearGradient>
  <radialGradient id="convex" cx="0.32" cy="0.26" r="0.85">
    <stop offset="0" stop-color="#c9b9a2" stop-opacity="0.17"/>
    <stop offset="0.55" stop-color="#8d7f6e" stop-opacity="0.06"/>
    <stop offset="1" stop-color="#000" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="underside" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.55"/>
  </linearGradient>
  <linearGradient id="sideShade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity="0.35"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.7"/>
  </linearGradient>
  <linearGradient id="roofShade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7a6450" stop-opacity="0.22"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.3"/>
  </linearGradient>
  <linearGradient id="doorDepth" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity="0.6"/>
    <stop offset="0.3" stop-color="#1a130d" stop-opacity="0.3"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.7"/>
  </linearGradient>
  <linearGradient id="raking" x1="0" y1="0" x2="1" y2="0.2">
    <stop offset="0" stop-color="#e0bd8f" stop-opacity="0.16"/>
    <stop offset="0.45" stop-color="#d9b88f" stop-opacity="0.02"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.4"/>
  </linearGradient>
  <filter id="grain" x="0" y="0" width="2000" height="2000" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse">
    <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="4" seed="7" result="noise"/>
    <feDiffuseLighting in="noise" surfaceScale="2.4" lighting-color="#e8dccb" result="lit">
      <feDistantLight azimuth="225" elevation="48"/>
    </feDiffuseLighting>
    <feComposite in="lit" in2="SourceGraphic" operator="arithmetic" k1="1.06" k2="0" k3="0" k4="0" result="tex"/>
    <feComposite in="tex" in2="SourceAlpha" operator="in"/>
  </filter>
  <filter id="coarse" x="0" y="0" width="2000" height="2000" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse">
    <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="3" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 0.62" result="blot"/>
    <feComposite in="blot" in2="SourceAlpha" operator="in"/>
  </filter>
  <linearGradient id="wallFade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity="0.75"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.15"/>
  </linearGradient>
  <filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="16"/></filter>
  <clipPath id="houseClip">
    <rect x="${HOUSE.left}" y="${HOUSE.top - 30}" width="${HOUSE.right - HOUSE.left}" height="${HOUSE.ground - HOUSE.top + 30}"/>
    <path d="M${HOUSE.right} ${HOUSE.top - 30}L${HOUSE.right + 150} ${HOUSE.top}L${HOUSE.right + 150} ${HOUSE.ground - 22}L${HOUSE.right} ${HOUSE.ground}Z"/>
  </clipPath>
  <radialGradient id="vignette" cx="0.5" cy="0.58" r="0.72">
    <stop offset="0.45" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.75"/>
  </radialGradient>
</defs>
<rect width="${SCENE}" height="${SCENE}" fill="url(#sky)"/>
<rect width="${SCENE}" height="${SCENE}" fill="url(#dawn)"/>
${hills()}
<g filter="url(#grain)">${ground()}${courtyardWall()}</g>
<g filter="url(#grain)">
  ${wallMortar}
  ${facadeSvg}
  ${sideWall()}
  ${roof()}
</g>
<g filter="url(#coarse)" opacity="0.5" clip-path="url(#houseClip)">
  <rect x="${HOUSE.left}" y="${HOUSE.top - 60}" width="${HOUSE.right - HOUSE.left + 150}" height="${HOUSE.ground - HOUSE.top + 60}" fill="#000"/>
</g>
${doorway}
<rect x="${WINDOW.left}" y="${f(windowRect.top)}" width="${WINDOW.right - WINDOW.left}" height="${f(windowRect.bottom - windowRect.top)}" fill="#070605"/>
<rect x="${HOUSE.left - 20}" y="${HOUSE.top - 70}" width="${HOUSE.right - HOUSE.left + 190}" height="${HOUSE.ground - HOUSE.top + 80}" fill="url(#raking)" clip-path="url(#houseClip)"/>
<rect width="${SCENE}" height="${SCENE}" fill="url(#vignette)"/>
</svg>`;
}
