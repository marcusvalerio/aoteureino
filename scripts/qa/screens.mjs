// Revisão visual: percorre o app e salva capturas de tela.
// Uso: node scripts/qa/screens.mjs [baseURL] [pasta]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:3100';
const OUT = process.argv[3] || 'qa-shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const errors = [];

async function ctx(opts = {}) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, ...opts });
  const p = await c.newPage();
  p.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(`[${m.type()}] ${p.url()} ${m.text()}`));
  p.on('pageerror', (e) => errors.push(`[pageerror] ${p.url()} ${e.message}`));
  return { c, p };
}
const shot = (p, name, full = false) => p.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. Abertura completa (primeira visita)
{
  const { c, p } = await ctx();
  await p.goto(BASE + '/?hoje=2026-10-04');
  await wait(900); await shot(p, '01-abertura-escuro');
  await wait(2200); await shot(p, '02-abertura-pedra');
  await wait(2600); await shot(p, '03-abertura-afastando');
  await wait(4200); await shot(p, '04-abertura-casa');
  await p.getByRole('button', { name: 'Entrar' }).click();
  await wait(1100); await shot(p, '05-abertura-porta');
  await wait(2400); await shot(p, '06-inicio');
  // segunda visita: abertura curta
  await p.reload(); await wait(600); await shot(p, '07-segunda-visita');
  // leitor
  await p.getByRole('link', { name: /Começar/ }).click(); await wait(1200);
  await shot(p, '08-leitor-topo');
  await p.mouse.wheel(0, 1400); await wait(1200); await shot(p, '09-leitor-meio');
  await shot(p, '10-leitor-inteiro', true);
  await p.getByRole('button', { name: 'Compartilhar uma reflexão' }).click(); await wait(1500);
  await shot(p, '11-compartilhar');
  await p.keyboard.press('Escape'); await wait(500);
  await p.getByRole('button', { name: 'Guardar frase' }).click();
  await p.getByRole('button', { name: 'Guardar devocional' }).click();
  await p.goto(BASE + '/palavra'); await wait(2500); await shot(p, '12-palavra');
  await p.getByRole('button', { name: 'Guardar passagem' }).click();
  await p.goto(BASE + '/jornada'); await wait(1500); await shot(p, '13-jornada'); await shot(p, '13b-jornada-inteira', true);
  await p.goto(BASE + '/salvos'); await wait(1200); await shot(p, '14-salvos');
  await p.goto(BASE + '/mais'); await wait(1200); await shot(p, '15-mais', true);
  await p.goto(BASE + '/dia/20'); await wait(1200); await shot(p, '16-dia-futuro');
  await p.goto(BASE + '/?ensaio=visita'); await wait(1500); await shot(p, '17-visita-luz');
  await wait(3000); await shot(p, '18-visita-titulo');
  await p.mouse.click(195, 420); await wait(2200); await shot(p, '19-visita-trecho');
  await p.goto(BASE + '/dia/15'); await wait(1200); await shot(p, '20-data-especial');
  await c.close();
}
// 2. Salvos vazio + modo escuro + movimento reduzido
{
  const { c, p } = await ctx({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await p.addInitScript(() => localStorage.setItem('atr.abertura.v1', '"vista"'));
  await p.goto(BASE + '/salvos?hoje=2026-10-04'); await wait(800); await shot(p, '21-salvos-vazio-escuro');
  await p.goto(BASE + '/'); await wait(800); await shot(p, '22-inicio-escuro');
  await p.goto(BASE + '/dia/4'); await wait(800); await shot(p, '23-leitor-escuro', true);
  await c.close();
}
// 3. Abertura com movimento reduzido
{
  const { c, p } = await ctx({ reducedMotion: 'reduce' });
  await p.goto(BASE + '/'); await wait(2500); await shot(p, '24-abertura-reduzida');
  await c.close();
}
// 3b. A visita no próprio dia (20/10), Jornada antes e depois, dias 19 e 31
{
  const { c, p } = await ctx();
  await p.addInitScript(() => localStorage.setItem('atr.abertura.v1', '"vista"'));
  await p.goto(BASE + '/jornada?hoje=2026-10-20'); await wait(1500);
  await p.mouse.wheel(0, 900); await wait(800); await shot(p, '29-jornada-antes-da-visita');
  await p.goto(BASE + '/'); await wait(700); await shot(p, '30-visita-transicao');
  await wait(2600); await shot(p, '31-visita-fresta');
  await wait(3200); await shot(p, '32-visita-titulo');
  await p.mouse.click(195, 420); await wait(2400); await shot(p, '33-visita-palavra');
  for (let k = 0; k < 6; k++) { await wait(2600); await p.mouse.click(195, 420); }
  await wait(2600); await shot(p, '34-visita-pare-aqui');
  for (let k = 0; k < 6; k++) { await wait(8200); await p.mouse.click(195, 420); }
  await wait(3800); await shot(p, '35-visita-fim');
  await p.mouse.click(195, 420); await wait(1800); await shot(p, '36-visita-depois-leitor');
  await p.goto(BASE + '/jornada'); await wait(1500); await p.mouse.wheel(0, 900); await wait(800); await shot(p, '37-jornada-depois-da-visita');
  await p.goto(BASE + '/'); await wait(1500); await shot(p, '38-inicio-depois-da-visita');
  await p.goto(BASE + '/dia/19'); await wait(1500); await shot(p, '39-dia-19', true);
  await p.goto(BASE + '/dia/27?hoje=2026-10-27'); await wait(1500); await shot(p, '39b-dia-27', true);
  await p.goto(BASE + '/?hoje=2026-10-31'); await wait(1500); await shot(p, '40-dia-31-inicio');
  await p.goto(BASE + '/palavra'); await wait(2500); await shot(p, '41-palavra-31');
  await c.close();
}
// 4. Desktop
{
  const { c, p } = await ctx({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, hasTouch: false });
  await p.goto(BASE + '/?hoje=2026-10-04'); await wait(12500); await shot(p, '25-abertura-desktop');
  await p.keyboard.press('Escape'); await wait(1500); await shot(p, '26-inicio-desktop');
  await p.goto(BASE + '/dia/4'); await wait(1200); await shot(p, '27-leitor-desktop');
  await c.close();
}
// 5. Tablet
{
  const { c, p } = await ctx({ viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1 });
  await p.addInitScript(() => localStorage.setItem('atr.abertura.v1', '"vista"'));
  await p.goto(BASE + '/jornada?hoje=2026-10-04'); await wait(1200); await shot(p, '28-jornada-tablet');
  await c.close();
}
await browser.close();
console.log(errors.length ? errors.join('\n') : 'Console limpo.');
