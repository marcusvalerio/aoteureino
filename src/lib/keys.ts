/** Chaves do armazenamento local. Versionadas para permitir migrações. */
export const KEYS = {
  settings: "atr.preferencias.v1",
  saved: "atr.salvos.v1",
  path: "atr.caminho.v1",
  opening: "atr.abertura.v2",
  visits: "atr.visitas.v1",
} as const;
