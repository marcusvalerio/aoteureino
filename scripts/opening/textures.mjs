// Texturas de pedra repetíveis (stitchTiles) usadas na interface.
// Uso: node scripts/opening/textures.mjs
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';

const OUT = new URL('../../public/textures/', import.meta.url);
const SIZE = 512;

function texture({ base, light, freq, scale, pores, poreColor, seed }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <filter id="t" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="5" seed="${seed}" stitchTiles="stitch" result="n"/>
    <feDiffuseLighting in="n" surfaceScale="${scale}" lighting-color="${light}" result="lit">
      <feDistantLight azimuth="225" elevation="52"/>
    </feDiffuseLighting>
    <feComposite in="lit" in2="SourceGraphic" operator="arithmetic" k1="1.1" k2="0" k3="0" k4="0" result="tex"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.33" numOctaves="2" seed="${seed + 4}" stitchTiles="stitch" result="p"/>
    <feColorMatrix in="p" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -26 0 0 0 ${pores}" result="pm"/>
    <feFlood flood-color="${poreColor}" result="pc"/>
    <feComposite in="pc" in2="pm" operator="in" result="dots"/>
    <feMerge><feMergeNode in="tex"/><feMergeNode in="dots"/></feMerge>
  </filter>
  <rect width="${SIZE}" height="${SIZE}" fill="${base}" filter="url(#t)"/>
</svg>`;
}

const jobs = [
  { name: 'calcario', svg: texture({ base: '#d6ccbb', light: '#fffaf0', freq: 0.022, scale: 2.2, pores: 7.6, poreColor: '#8d8273', seed: 21 }) },
  { name: 'basalto', svg: texture({ base: '#45403a', light: '#f3e9da', freq: 0.03, scale: 2.8, pores: 8.2, poreColor: '#0e0c0a', seed: 5 }) },
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
for (const job of jobs) {
  const data = await page.evaluate(async ({ svg, size }) => {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode();
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.82);
  }, { svg: job.svg, size: SIZE });
  const buf = Buffer.from(data.split(',')[1], 'base64');
  writeFileSync(new URL(`${job.name}.webp`, OUT), buf);
  console.log(job.name, Math.round(buf.length / 1024) + 'KB');
}
await browser.close();
