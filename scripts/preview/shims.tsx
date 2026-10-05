/**
 * Substitutos de next/link e next/navigation para a prévia em página única
 * (Artifact). Rotas viram âncoras: /dia/4 → #dia-4, /palavra → #palavra.
 */
import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from "react";

export function toHash(href: string) {
  const [path, query] = href.split("?");
  const clean = path.replace(/^\/+|\/+$/g, "");
  const params = new URLSearchParams(query ?? "");
  const extra = params.get("ensaio") ? `ensaio-${params.get("ensaio")}` : "";
  const base = clean.replace(/\//g, "-");
  return "#" + [base, extra].filter(Boolean).join("--");
}

export function hashToPath() {
  const h = window.location.hash.replace(/^#/, "").split("--")[0];
  if (!h || h.startsWith("ensaio-")) return "/";
  const m = h.match(/^dia-(\d+)$/);
  return m ? `/dia/${m[1]}` : `/${h}`;
}

function go(href: string) {
  const h = toHash(href);
  if (window.location.hash !== h) {
    if (h === "#") history.pushState(null, "", window.location.pathname + window.location.search);
    else window.location.hash = h;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
  window.scrollTo(0, 0);
}

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  window.addEventListener("popstate", cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener("popstate", cb);
  };
};

export function usePathname() {
  return useSyncExternalStore(subscribe, hashToPath, () => "/");
}

export function useSearchParams() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => "");
  const p = new URLSearchParams();
  const m = hash.match(/(?:^#|--)ensaio-(\w+)/);
  if (m) p.set("ensaio", m[1]);
  return p;
}

export function useRouter() {
  return { push: go, replace: go, back: () => history.back(), forward: () => history.forward(), refresh: () => {}, prefetch: () => {} };
}

export function notFound(): never {
  throw new Error("not found");
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; prefetch?: boolean; scroll?: boolean };

export default function Link({ href, onClick, prefetch, scroll, ...rest }: LinkProps) {
  void prefetch;
  void scroll;
  return (
    <a
      href={toHash(href)}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        go(href);
      }}
      {...rest}
    />
  );
}
