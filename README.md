# AO TEU REINO — Devocional Evangélico

MVP 1.0 · mobile-first · Next.js 16, React 19, TypeScript, Tailwind CSS 4, Motion, Lucide.

Pedra · luz · caminho · casa · Palavra · silêncio · presença.

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
content/fonte/outubro-2026.txt     fonte editorial (não editar à mão no código)
scripts/import-content.mts         .txt → src/content/outubro-2026/devotionals.json
scripts/opening/                   gera a cena da abertura e as texturas de pedra (WebP)
scripts/qa/screens.mjs             capturas de tela para revisão visual
src/content/                       modelo (types.ts), repositório (index.ts), seleção da PALAVRA
src/lib/                           datas, preferências, salvos, caminho — tudo local
src/components/opening/            abertura (pedra → casa → porta)
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
(ENCONTRO, DATA ESPECIAL, PAUSA, MERGULHO, A VISITA DO ANJO), e lista o que faltar.
