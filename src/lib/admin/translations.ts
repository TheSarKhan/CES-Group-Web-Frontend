/**
 * Qeyddə hansı dildə neçə tərcümə sahəsinin çatışmadığını sayır (backend-dəki TranslationGaps ilə eyni qayda):
 * azərbaycanca mətni olan sahənin həmin dildə mətni yoxdursa çatışır. Sayt yalnız çatışması 0 olan qeydi en/ru-da açır.
 */
const LANGS = new Set(["az", "en", "ru"]);
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const isTranslatable = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0 && Object.keys(v).every((k) => LANGS.has(k));

export function gapsFor(data: unknown, lang: string): number {
  if (isTranslatable(data)) return !text(data.az) || text(data[lang]) ? 0 : 1;
  if (Array.isArray(data)) return data.reduce<number>((n, x) => n + gapsFor(x, lang), 0);
  if (data && typeof data === "object") return Object.values(data).reduce<number>((n, x) => n + gapsFor(x, lang), 0);
  return 0;
}
