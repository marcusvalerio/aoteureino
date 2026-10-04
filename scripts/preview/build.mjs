// Prévia em página única para publicar como Artifact.
// Uso: node scripts/preview/build.mjs  → preview/index.html + imagens
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const out = root + "preview/";
const shims = root + "scripts/preview/shims.tsx";
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// Caminhos absolutos (/opening, /textures) viram relativos à página.
const relative = (s) => s.replace(/(["'(\s,])\/(opening|textures)\//g, "$1$2/");

const cssIn = root + "src/app/globals.css";
const css = await postcss([tailwind({ base: root })]).process(readFileSync(cssIn, "utf8"), { from: cssIn });

const js = await build({
  entryPoints: [root + "scripts/preview/entry.tsx"],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  tsconfig: root + "tsconfig.json",
  alias: { "next/link": shims, "next/navigation": shims },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});

const { BOOT_SCRIPT } = await import(root + "src/lib/boot.ts").catch(async () => {
  // boot.ts é TypeScript: extrai o literal sem executar o restante.
  const src = readFileSync(root + "src/lib/boot.ts", "utf8");
  const keys = Object.fromEntries([...readFileSync(root + "src/lib/keys.ts", "utf8").matchAll(/(\w+): "([^"]+)"/g)].map((m) => [m[1], m[2]]));
  const body = src.slice(src.indexOf("`") + 1, src.lastIndexOf("`")).replace(/\$\{KEYS\.(\w+)\}/g, (_, k) => keys[k]);
  return { BOOT_SCRIPT: body };
});

const script = relative(js.outputFiles[0].text).replace(/<\/script/gi, "<\\/script");
const style = relative(css.css);

const html = `<title>Ao Teu Reino</title>
<meta name="description" content="Devocional evangélico — prévia do MVP 1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Faculty+Glyphic&family=Geist:wght@300..600&display=swap">
<style>
:root{--font-faculty:"Faculty Glyphic","Iowan Old Style",Georgia,serif;--font-geist:"Geist",ui-sans-serif,system-ui,sans-serif}
html,body{min-height:100%}
body{margin:0;background:transparent}
${style}
</style>
<script>${BOOT_SCRIPT}</script>
<div id="app"></div>
<script>${script}</script>
`;
writeFileSync(out + "index.html", html);
cpSync(root + "public/opening", out + "opening", { recursive: true });
cpSync(root + "public/textures", out + "textures", { recursive: true });
console.log(`preview/index.html ${Math.round(html.length / 1024)}KB`);
