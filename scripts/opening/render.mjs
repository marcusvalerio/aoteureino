// Renderiza a cena da abertura em WebP usando o Chromium local.
// Uso: node scripts/opening/render.mjs
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
import { buildScene, FOCUS } from './scene.mjs';

const OUT = new URL('../../public/opening/', import.meta.url);
const CLOSE = 600; // tamanho, em unidades da cena, do recorte de detalhe

const jobs = [
  { name: 'casa', svg: buildScene({ width: 2400, height: 2400 }), size: 2400, quality: 0.8 },
  { name: 'casa-1200', svg: buildScene({ width: 1200, height: 1200 }), size: 1200, quality: 0.8 },
  {
    name: 'pedra',
    svg: buildScene({
      viewBox: `${FOCUS.x - CLOSE / 2 + 76} ${FOCUS.y - CLOSE / 2 - 24} ${CLOSE} ${CLOSE}`,
      width: 2000,
      height: 2000,
    }),
    size: 2000,
    quality: 0.78,
  },
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
for (const job of jobs) {
  if (process.argv.includes('--svg')) writeFileSync(new URL(`${job.name}.svg`, OUT), job.svg);
  const data = await page.evaluate(
    async ({ svg, size, quality }) => {
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      await img.decode();
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      c.getContext('2d').drawImage(img, 0, 0, size, size);
      return c.toDataURL('image/webp', quality);
    },
    { svg: job.svg, size: job.size, quality: job.quality },
  );
  const buf = Buffer.from(data.split(',')[1], 'base64');
  writeFileSync(new URL(`${job.name}.webp`, OUT), buf);
  console.log(job.name, Math.round(buf.length / 1024) + 'KB');
}
await browser.close();
