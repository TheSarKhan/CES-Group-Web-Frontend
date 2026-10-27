/** Saytın dilləri. Az kökdə qalır (mövcud URL-lər dəyişmir), en və ru `/en/...`, `/ru/...` prefiksi ilə açılır. */
export const LANGS = ["az", "en", "ru"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "az";
/** Açıq dillər: tərcümə yolu hazır olana qədər yalnız az */
export const ENABLED_LANGS: readonly Lang[] = ["az"];

export const isLang = (v: string): v is Lang => (LANGS as readonly string[]).includes(v);

/** Dilin URL prefiksi: az üçün boş */
export const prefixOf = (lang: Lang) => (lang === DEFAULT_LANG ? "" : `/${lang}`);

/** Daxili yolu dilə uyğun yola çevirir: ("en", "/elaqe") → "/en/elaqe"; ("az", "/") → "/" */
export function localePath(lang: Lang, path: string): string {
  if (lang === DEFAULT_LANG) return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** hreflang və <html lang> üçün */
export const htmlLang: Record<Lang, string> = { az: "az", en: "en", ru: "ru" };
/** Open Graph locale */
export const ogLocale: Record<Lang, string> = { az: "az_AZ", en: "en_US", ru: "ru_RU" };
