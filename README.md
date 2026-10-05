# AO TEU REINO — Devocional Evangélico

MVP 1.0 · mobile-first · Next.js 16, React 19, TypeScript, Tailwind CSS 4, Motion, Lucide.
Tipografia: Instrument Serif (títulos) e Geist (interface).

Luz · movimento · espaço · Palavra · presença.

## Rodar

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint && npm run typecheck && npm run build
```

Para revisar dias específicos: `?hoje=2026-10-15` (vale para a sessão; `?hoje=real` volta ao normal).
Ensaio da experiência escondida: `/?ensaio=visita`.

## Estrutura

```
content/fonte/outubro-2026.txt     fonte editorial (não é editada)
content/editorial/                 ajustes rastreáveis (.ajustes.json) e notas de decisão
scripts/import-content.mts         .txt → src/content/outubro-2026/devotionals.json
scripts/qa/screens.mjs             capturas de tela para revisão visual
src/content/                       modelo (types.ts), repositório (index.ts), seleção da PALAVRA
src/lib/                           datas, preferências, salvos, caminho — tudo local
src/components/light/              campo de luz (LightField) e composições (presets)
src/components/opening/            abertura (luz → toque → o nome desce → a interface nasce)
src/components/special/Visita.tsx  experiência escondida
src/components/share/              cartão de compartilhamento (canvas)
src/app/                           rotas: / · /dia/[dia] · /palavra · /jornada · /salvos · /mais
```

O conteúdo nunca é escrito dentro dos componentes: a interface lê de `src/content/index.ts`.
Trocar a origem (CMS/API) significa trocar esse módulo.

### Atualizar o conteúdo do mês

```bash
npm run content:import                     # usa content/fonte/outubro-2026.txt
npm run content:import -- outro-arquivo.txt
```

O importador preserva o texto, reconhece as seções (PALAVRA, REFLEXÃO, PARE AQUI, ORE,
VIVA ISSO HOJE, PARA LEVAR COM VOCÊ, REFERÊNCIA) e marcadores de dia
(ENCONTRO, DATA ESPECIAL, PAUSA, MERGULHO, A VISITA DO ANJO), e lista o que faltar. Em seguida aplica `content/editorial/outubro-2026.ajustes.json`:
cada alteração tem dia, campo, valor e motivo, e `"novo": true` marca texto escrito fora da fonte
(`--sem-ajustes` importa a fonte pura).

A PALAVRA mostra apenas referências até a tradução bíblica ser definida e licenciada
(`src/content/palavra/selecao.ts`, campo `verses`). Os textos provisórios do protótipo ficam
isolados em `textos-provisorios.ts` e não são importados pela interface.

### Prévia em página única

`npm run preview:artifact` gera `preview/` — os mesmos componentes, com rotas por âncora
(`#palavra`, `#dia-4`, `#jornada`, `#ensaio-visita`), para publicar como página privada.
