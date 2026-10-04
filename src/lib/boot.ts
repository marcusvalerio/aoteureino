import { KEYS } from "./keys";

/**
 * Script inline executado antes da primeira pintura: aplica tema e decide
 * se a abertura completa deve aparecer. Mantido pequeno e sem dependências.
 */
export const BOOT_SCRIPT = `(function(){try{
var d=document.documentElement,s={};
try{s=JSON.parse(localStorage.getItem('${KEYS.settings}')||'{}')||{}}catch(e){}
var t=s.theme||'sistema';
var dark=t==='escuro'||(t==='sistema'&&matchMedia('(prefers-color-scheme: dark)').matches);
d.dataset.theme=dark?'dark':'light';
d.dataset.text=String(s.textSize==null?1:s.textSize);
d.dataset.motion=(s.motion==='reduzido'||matchMedia('(prefers-reduced-motion: reduce)').matches)?'reduced':'full';
var seen=null;try{seen=localStorage.getItem('${KEYS.opening}')}catch(e){}
d.dataset.opening=seen?'short':'full';
}catch(e){document.documentElement.dataset.opening='short'}})();`;
